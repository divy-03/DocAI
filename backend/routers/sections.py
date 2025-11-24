from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Section, Project, User
from schemas import SectionResponse
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/sections", tags=["sections"])

class SectionUpdateRequest(BaseModel):
    title: str = None
    content: str = None

@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    update_data: SectionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually update section title or content
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
            detail="Not authorized to modify this section"
        )
    
    # Update fields
    if update_data.title is not None:
        section.title = update_data.title
    if update_data.content is not None:
        section.content = update_data.content
    
    db.commit()
    db.refresh(section)
    
    return section
