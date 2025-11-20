from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import asyncio
from database import get_db
from models import Project, Section, User
from schemas import ProjectResponse, SectionResponse
from auth import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/generation", tags=["generation"])

@router.post("/projects/{project_id}/generate", response_model=ProjectResponse)
async def generate_project_content(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI content for all sections of a project
    """
    # Get project with sections
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if sections exist
    if not project.sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has no sections to generate content for"
        )
    
    # Sort sections by order
    sections = sorted(project.sections, key=lambda x: x.order)
    
    # Generate content for each section
    context = ""  # Build context from previous sections
    
    for section in sections:
        try:
            # Generate content with context from previous sections
            content = await gemini_service.generate_section_content(
                topic=project.topic,
                section_title=section.title,
                document_type=project.document_type.value,
                context=context,
                word_count=300 if project.document_type.value == "docx" else 150
            )
            
            # Update section with generated content
            section.content = content
            
            # Add to context for next sections (limit context size)
            if len(context) < 1000:  # Limit context to prevent token overflow
                context += f"\n\n{section.title}: {content[:200]}..."
            
            # Small delay to respect API rate limits
            await asyncio.sleep(0.5)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating content for section '{section.title}': {str(e)}"
            )
    
    # Commit all changes
    db.commit()
    db.refresh(project)
    
    return project

@router.post("/projects/{project_id}/generate/{section_id}", response_model=SectionResponse)
async def generate_section_content(
    project_id: int,
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Regenerate content for a specific section
    """
    # Get project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get section
    section = db.query(Section).filter(
        Section.id == section_id,
        Section.project_id == project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Build context from previous sections
    previous_sections = db.query(Section).filter(
        Section.project_id == project_id,
        Section.order < section.order
    ).order_by(Section.order).all()
    
    context = ""
    for prev_section in previous_sections[-2:]:  # Last 2 sections for context
        if prev_section.content:
            context += f"{prev_section.title}: {prev_section.content[:150]}...\n"
    
    try:
        # Generate new content
        content = await gemini_service.generate_section_content(
            topic=project.topic,
            section_title=section.title,
            document_type=project.document_type.value,
            context=context,
            word_count=300 if project.document_type.value == "docx" else 150
        )
        
        # Update section
        section.content = content
        db.commit()
        db.refresh(section)
        
        return section
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating content: {str(e)}"
        )

@router.post("/outline/generate")
async def generate_outline(
    topic: str,
    document_type: str,
    section_count: int = 5,
    current_user: User = Depends(get_current_user)
):
    """
    Generate document outline/structure using AI
    """
    if document_type not in ["docx", "pptx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document type. Must be 'docx' or 'pptx'"
        )
    
    if section_count < 3 or section_count > 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section count must be between 3 and 15"
        )
    
    try:
        titles = await gemini_service.generate_outline(
            topic=topic,
            document_type=document_type,
            section_count=section_count
        )
        
        return {
            "topic": topic,
            "document_type": document_type,
            "sections": [
                {"title": title, "order": idx}
                for idx, title in enumerate(titles)
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating outline: {str(e)}"
        )
