import google.generativeai as genai
from typing import Optional, List
import asyncio
from config import get_settings
import re

settings = get_settings()

class GeminiService:
    def __init__(self):
        """Initialize Gemini API with API key"""
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def generate_section_content(
        self, 
        topic: str, 
        section_title: str,
        document_type: str = "docx",
        context: str = "",
        word_count: int = 250
    ) -> str:
        """
        Generate content for a specific section using Gemini API
        
        Args:
            topic: Main topic of the document
            section_title: Title of the current section
            document_type: Type of document (docx/pptx)
            context: Previous sections content for context
            word_count: Target word count for the content
            
        Returns:
            Generated content as string (clean, no markdown)
        """
        try:
            if document_type == "pptx":
                prompt = f"""
You are a professional presentation content writer. Create concise, impactful slide content.

Presentation Topic: {topic}
Slide Title: {section_title}
{f'Previous Slides Context: {context}' if context else ''}

Generate clear, bullet-point style content for this slide:
- Use 3-5 bullet points maximum
- Keep each point concise (1-2 sentences max)
- Focus on key insights and takeaways
- Use professional but engaging language
- Ensure content flows logically from previous slides

IMPORTANT: Return ONLY the bullet points, one per line, without any markdown symbols (*, -, •, etc.), numbering, or formatting.
Do not include the slide title.
Each bullet point should start fresh on a new line.

Example output format:
First key point about the topic
Second important insight or detail
Third main takeaway
Fourth supporting information
"""
            else:  # docx
                prompt = f"""
You are a professional technical writer creating high-quality document content.

Document Topic: {topic}
Section Title: {section_title}
{f'Previous Sections Context: {context}' if context else ''}

Generate detailed, professional content for this section:
- Write approximately {word_count} words
- Use clear, formal language
- Include relevant details and examples
- Ensure smooth transition from previous sections
- Maintain consistent tone throughout
- Structure content with proper paragraphs

IMPORTANT: Return ONLY clean paragraph text without any markdown formatting (no *, #, **, etc.).
Do not include the section title.
Use natural paragraph breaks (blank line between paragraphs).
Write in plain text format ready for direct insertion into a document.
"""

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            content = response.text.strip()
            
            # Clean up any remaining markdown artifacts
            if document_type == "pptx":
                content = self._clean_bullet_content(content)
            else:
                content = self._clean_paragraph_content(content)
            
            return content
            
        except Exception as e:
            raise Exception(f"Error generating content with Gemini: {str(e)}")
    
    def _clean_bullet_content(self, text: str) -> str:
        """
        Clean bullet point content by removing markdown symbols
        """
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Remove leading markdown bullets
            if line.startswith('*'):
                line = line.lstrip('*').strip()
            elif line.startswith('-'):
                line = line.lstrip('-').strip()
            elif line.startswith('•'):
                line = line.lstrip('•').strip()
            elif line.startswith('→'):
                line = line.lstrip('→').strip()
            elif line.startswith('►'):
                line = line.lstrip('►').strip()
            
            # Remove numbering: "1.", "1)", etc.
            if line and line[0].isdigit():
                match = re.match(r'^[\d]+[\.\)\-\s]+', line)
                if match:
                    line = line[match.end():].strip()
            
            if line:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _clean_paragraph_content(self, text: str) -> str:
        """
        Clean paragraph content by removing markdown formatting
        """
        # Remove markdown bold/italic
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'__(.+?)__', r'\1', text)
        text = re.sub(r'_(.+?)_', r'\1', text)
        text = re.sub(r'~~(.+?)~~', r'\1', text)
        
        # Remove markdown headings
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        
        # Remove markdown lists (convert to text)
        text = re.sub(r'^\s*[-*•]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Clean up excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()
    
    def parse_outline(self, text: str) -> List[str]:
        """
        Parse AI-generated outline text into a list of section titles
        
        Args:
            text: Raw text from AI containing numbered or bulleted list
            
        Returns:
            List of clean section titles
        """
        lines = text.strip().split('\n')
        titles = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Remove common numbering patterns
            cleaned = line
            
            # Remove numbering: "1.", "1)", etc.
            if line and line[0].isdigit():
                match = re.match(r'^[\d]+[\.\)\-\s]+', line)
                if match:
                    cleaned = line[match.end():].strip()
            # Remove bullet points: "•", "-", "*"
            elif line and line[0] in ['•', '-', '*', '→', '►']:
                cleaned = line[1:].strip()
            
            # Only add non-empty titles
            if cleaned:
                titles.append(cleaned)
        
        return titles
    
    async def generate_outline(
        self,
        topic: str,
        document_type: str = "docx",
        section_count: int = 5
    ) -> List[str]:
        """
        Generate document outline/structure using Gemini API
        
        Args:
            topic: Main topic of the document
            document_type: Type of document (docx/pptx)
            section_count: Number of sections/slides to generate
            
        Returns:
            List of section/slide titles
        """
        try:
            if document_type == "pptx":
                prompt = f"""
Generate a professional presentation outline for: {topic}

Requirements:
- Create exactly {section_count} slide titles
- Make titles concise and clear (5-8 words each)
- Structure: Start with Introduction, cover main points, end with Conclusion
- Ensure logical flow between slides
- Use professional, engaging language

Format: Return ONLY the slide titles as a numbered list.

Example format:
1. [Title]
2. [Title]
3. [Title]

Generate {section_count} slide titles now. Output ONLY the numbered list, nothing else:
"""
            else:  # docx
                prompt = f"""
Generate a comprehensive document outline for: {topic}

Requirements:
- Create exactly {section_count} section titles
- Make titles descriptive and professional
- Structure: Introduction, main content sections, conclusion
- Follow academic/professional writing standards
- Ensure comprehensive coverage of the topic

Format: Return ONLY the section titles as a numbered list.

Example format:
1. [Title]
2. [Title]
3. [Title]

Generate {section_count} section titles now. Output ONLY the numbered list, nothing else:
"""

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            # Parse the response to extract titles
            titles = self.parse_outline(response.text)
            
            # Return exactly section_count titles (or pad if fewer)
            if len(titles) < section_count:
                for i in range(len(titles), section_count):
                    titles.append(f"Additional Section {i + 1}")
            
            return titles[:section_count]
            
        except Exception as e:
            raise Exception(f"Error generating outline with Gemini: {str(e)}")

# Create singleton instance
gemini_service = GeminiService()
