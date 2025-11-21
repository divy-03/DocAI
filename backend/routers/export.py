from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Project, Section, User
from auth import get_current_user
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pptx import Presentation
from pptx.util import Inches, Pt as PptPt
import io

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
        # Create filename
        safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in project.title)
        safe_title = safe_title.replace(' ', '_')
        
        if project.document_type.value == "docx":
            # Create DOCX in memory
            file_stream = create_docx(project, sections)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"{safe_title}.docx"
        else:  # pptx
            # Create PPTX in memory
            file_stream = create_pptx(project, sections)
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            filename = f"{safe_title}.pptx"
        
        # Return as streaming response
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": media_type
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting document: {str(e)}"
        )

def create_docx(project: Project, sections: list) -> io.BytesIO:
    """
    Create DOCX file in memory from project content
    Returns: BytesIO stream
    """
    # Create document
    doc = Document()
    
    # Set default font
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    
    # Add title
    title = doc.add_heading(project.title, 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.runs[0]
    title_run.font.color.rgb = RGBColor(31, 78, 121)
    title_run.font.size = Pt(36)
    
    # Add topic as subtitle
    topic_para = doc.add_paragraph(project.topic)
    topic_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    topic_para_run = topic_para.runs[0]
    topic_para_run.italic = True
    topic_para_run.font.size = Pt(14)
    topic_para_run.font.color.rgb = RGBColor(89, 89, 89)
    
    # Add page break
    doc.add_page_break()
    
    # Add each section
    for idx, section in enumerate(sections):
        if section.content:
            # Section heading
            heading = doc.add_heading(section.title, 1)
            heading_run = heading.runs[0]
            heading_run.font.color.rgb = RGBColor(31, 78, 121)
            heading_run.font.size = Pt(24)
            
            # Section content
            content_para = doc.add_paragraph(section.content)
            content_para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            content_para.paragraph_format.line_spacing = 1.15
            content_para.paragraph_format.space_after = Pt(12)
            
            # Add spacing between sections (but not after last one)
            if idx < len([s for s in sections if s.content]) - 1:
                doc.add_paragraph()
    
    # Save to BytesIO stream
    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    
    return file_stream

def create_pptx(project: Project, sections: list) -> io.BytesIO:
    """
    Create PPTX file in memory from project content
    Returns: BytesIO stream
    """
    # Create presentation
    prs = Presentation()
    
    # Set slide dimensions (16:9)
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # Title slide
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title.text = project.title
    subtitle.text = project.topic
    
    # Format title slide
    for paragraph in title.text_frame.paragraphs:
        paragraph.font.size = PptPt(54)
        paragraph.font.bold = True
    
    for paragraph in subtitle.text_frame.paragraphs:
        paragraph.font.size = PptPt(24)
    
    # Content slides
    for section in sections:
        if section.content:
            # Use title and content layout
            content_slide_layout = prs.slide_layouts[1]
            slide = prs.slides.add_slide(content_slide_layout)
            
            # Set title
            title_shape = slide.shapes.title
            title_shape.text = section.title
            
            # Format title
            for paragraph in title_shape.text_frame.paragraphs:
                paragraph.font.size = PptPt(40)
                paragraph.font.bold = True
            
            # Set content
            body_shape = slide.placeholders[1]
            text_frame = body_shape.text_frame
            text_frame.clear()
            
            # Split content into bullet points
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
                    p.font.size = PptPt(20)
                    p.space_before = PptPt(6)
                    p.space_after = PptPt(6)
    
    # Save to BytesIO stream
    file_stream = io.BytesIO()
    prs.save(file_stream)
    file_stream.seek(0)
    
    return file_stream

