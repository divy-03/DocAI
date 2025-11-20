from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Project, Section, User
from auth import get_current_user
from docx import Document
from docx.shared import Pt, Inches
from pptx import Presentation
from pptx.util import Inches, Pt as PptPt
import os
import tempfile

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/projects/{project_id}/download")
async def export_document(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export project as DOCX or PPTX file
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
    
    # Get sections ordered by order
    sections = db.query(Section).filter(
        Section.project_id == project_id
    ).order_by(Section.order).all()
    
    if not sections or not any(s.content for s in sections):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content to export. Generate content first."
        )
    
    try:
        if project.document_type.value == "docx":
            file_path = create_docx(project, sections)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"{project.title.replace(' ', '_')}.docx"
        else:
            file_path = create_pptx(project, sections)
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            filename = f"{project.title.replace(' ', '_')}.pptx"
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting document: {str(e)}"
        )

def create_docx(project: Project, sections: list) -> str:
    """
    Create DOCX file from project content
    """
    doc = Document()
    
    # Add title
    title = doc.add_heading(project.title, 0)
    title.alignment = 1  # Center alignment
    
    # Add topic as subtitle
    topic_para = doc.add_paragraph(project.topic)
    topic_para.alignment = 1
    topic_para.runs[0].italic = True
    topic_para.runs[0].font.size = Pt(12)
    
    doc.add_paragraph()  # Spacing
    
    # Add each section
    for section in sections:
        if section.content:
            # Section heading
            heading = doc.add_heading(section.title, 1)
            
            # Section content
            content_para = doc.add_paragraph(section.content)
            content_para.alignment = 3  # Justify
            
            # Add spacing between sections
            doc.add_paragraph()
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
    doc.save(temp_file.name)
    temp_file.close()
    
    return temp_file.name

def create_pptx(project: Project, sections: list) -> str:
    """
    Create PPTX file from project content
    """
    prs = Presentation()
    
    # Set slide size to standard (16:9)
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # Title slide
    title_slide_layout = prs.slide_layouts[0]
    title_slide = prs.slides.add_slide(title_slide_layout)
    title = title_slide.shapes.title
    subtitle = title_slide.placeholders[1]
    
    title.text = project.title
    subtitle.text = project.topic
    
    # Content slides
    for section in sections:
        if section.content:
            # Use title and content layout
            slide_layout = prs.slide_layouts[1]
            slide = prs.slides.add_slide(slide_layout)
            
            # Set title
            title = slide.shapes.title
            title.text = section.title
            
            # Set content
            content_placeholder = slide.placeholders[1]
            text_frame = content_placeholder.text_frame
            
            # Split content into bullet points (if not already)
            content_lines = section.content.split('\n')
            
            for i, line in enumerate(content_lines):
                line = line.strip()
                if line:
                    if i == 0:
                        p = text_frame.paragraphs[0]
                    else:
                        p = text_frame.add_paragraph()
                    
                    p.text = line
                    p.level = 0
                    p.font.size = PptPt(18)
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pptx')
    prs.save(temp_file.name)
    temp_file.close()
    
    return temp_file.name
