from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Section, Refinement, Feedback, User, Project
from schemas import (
    RefinementCreate, 
    RefinementResponse, 
    FeedbackCreate, 
    FeedbackResponse,
    SectionDetailResponse,
    SectionResponse
)
from auth import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/refinement", tags=["refinement"])

@router.post("/sections/{section_id}/refine", response_model=SectionResponse)
async def refine_section(
    section_id: int,
    refinement_data: RefinementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refine a section's content based on user prompt
    """
    # Get section with project
    section = db.query(Section).filter(Section.id == section_id).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify user owns the project
    project = db.query(Project).filter(
        Project.id == section.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this section"
        )
    
    if not section.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot refine section without existing content"
        )
    
    try:
        # Create refinement prompt
        refinement_prompt = f"""
You are refining existing content based on user feedback.

Original Content:
{section.content}

User's Refinement Request:
{refinement_data.prompt}

Generate improved content that:
- Addresses the user's specific refinement request
- Maintains the overall structure and flow
- Keeps approximately the same length
- Improves quality based on the feedback
- Stays relevant to the section topic

Generate only the refined content, no additional formatting or explanations.
"""
        
        # Generate refined content
        loop = __import__('asyncio').get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: gemini_service.model.generate_content(refinement_prompt)
        )
        
        new_content = response.text.strip()
        
        # Store refinement history
        refinement = Refinement(
            prompt=refinement_data.prompt,
            previous_content=section.content,
            new_content=new_content,
            section_id=section_id
        )
        db.add(refinement)
        
        # Update section content
        section.content = new_content
        
        db.commit()
        db.refresh(section)
        
        return section
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refining content: {str(e)}"
        )

@router.get("/sections/{section_id}/refinements", response_model=List[RefinementResponse])
async def get_refinements(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get refinement history for a section
    """
    section = db.query(Section).filter(Section.id == section_id).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify user owns the project
    project = db.query(Project).filter(
        Project.id == section.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view refinements"
        )
    
    refinements = db.query(Refinement).filter(
        Refinement.section_id == section_id
    ).order_by(Refinement.created_at.desc()).all()
    
    return refinements

@router.post("/sections/{section_id}/feedback", response_model=FeedbackResponse)
async def add_feedback(
    section_id: int,
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add feedback (like/dislike/comment) to a section
    """
    section = db.query(Section).filter(Section.id == section_id).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify user owns the project
    project = db.query(Project).filter(
        Project.id == section.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to provide feedback"
        )
    
    # Create feedback
    feedback = Feedback(
        feedback_type=feedback_data.feedback_type,
        comment=feedback_data.comment,
        section_id=section_id
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    return feedback

@router.get("/sections/{section_id}/feedback", response_model=List[FeedbackResponse])
async def get_feedback(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all feedback for a section
    """
    section = db.query(Section).filter(Section.id == section_id).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify user owns the project
    project = db.query(Project).filter(
        Project.id == section.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view feedback"
        )
    
    feedback = db.query(Feedback).filter(
        Feedback.section_id == section_id
    ).order_by(Feedback.created_at.desc()).all()
    
    return feedback

@router.get("/sections/{section_id}/details", response_model=SectionDetailResponse)
async def get_section_details(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get section with all refinements and feedback
    """
    section = db.query(Section).filter(Section.id == section_id).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Verify user owns the project
    project = db.query(Project).filter(
        Project.id == section.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view section details"
        )
    
    return section
