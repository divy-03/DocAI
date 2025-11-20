from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Project, Section, User
from schemas import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectListResponse
from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project with sections
    """
    # Create project
    new_project = Project(
        title=project_data.title,
        topic=project_data.topic,
        document_type=project_data.document_type,
        user_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Create sections
    for section_data in project_data.sections:
        section = Section(
            title=section_data.title,
            order=section_data.order,
            project_id=new_project.id
        )
        db.add(section)
    
    db.commit()
    db.refresh(new_project)
    
    return new_project

@router.get("", response_model=List[ProjectListResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all projects for the current user
    """
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(Project.updated_at.desc()).all()
    
    # Add section count to each project
    result = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "title": project.title,
            "topic": project.topic,
            "document_type": project.document_type,
            "user_id": project.user_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "section_count": len(project.sections)
        }
        result.append(ProjectListResponse(**project_dict))
    
    return result

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project with all sections
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update project details
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update fields
    if project_update.title is not None:
        project.title = project_update.title
    if project_update.topic is not None:
        project.topic = project_update.topic
    
    db.commit()
    db.refresh(project)
    
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project and all its sections
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    
    return None
