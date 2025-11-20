import google.generativeai as genai
from typing import Optional
import asyncio
from config import get_settings

settings = get_settings()

class GeminiService:
    def __init__(self):
        """Initialize Gemini API with API key"""
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
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
            Generated content as string
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
- Keep each point concise (1-2 sentences)
- Focus on key insights and takeaways
- Use professional but engaging language
- Ensure content flows logically from previous slides

Generate only the content, no additional formatting or explanations.
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

Generate only the content, no section title or additional formatting.
"""

            # Run the synchronous generate_content in a thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            return response.text.strip()
            
        except Exception as e:
            raise Exception(f"Error generating content with Gemini: {str(e)}")
    
    async def generate_outline(
        self,
        topic: str,
        document_type: str = "docx",
        section_count: int = 5
    ) -> list:
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
Generate a presentation outline for the topic: {topic}

Create exactly {section_count} slide titles that:
- Form a logical, flowing narrative
- Cover the topic comprehensively
- Are concise and clear (5-8 words each)
- Follow this structure: Introduction, Main Points, Conclusion

Format: Return only the slide titles, one per line, numbered.
Example:
1. Introduction to [Topic]
2. Key Concepts and Definitions
3. [Main Point]
...
{section_count}. Conclusion and Next Steps
"""
            else:  # docx
                prompt = f"""
Generate a document outline for the topic: {topic}

Create exactly {section_count} section titles that:
- Form a logical, comprehensive structure
- Cover the topic thoroughly
- Are clear and descriptive
- Follow academic/professional writing standards

Format: Return only the section titles, one per line, numbered.
Example:
1. Introduction
2. Background and Context
3. [Main Section]
...
{section_count}. Conclusion
"""

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            # Parse the response to extract titles
            lines = response.text.strip().split('\n')
            titles = []
            
            for line in lines:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                    # Remove numbering and bullet points
                    title = line.split('.', 1)[-1].strip() if '.' in line else line.lstrip('-•').strip()
                    if title:
                        titles.append(title)
            
            # Return exactly section_count titles
            return titles[:section_count] if len(titles) >= section_count else titles
            
        except Exception as e:
            raise Exception(f"Error generating outline with Gemini: {str(e)}")

# Create singleton instance
gemini_service = GeminiService()
