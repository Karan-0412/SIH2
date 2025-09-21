// AI Text Generation Service for Resume Content
import { supabase } from '@/integrations/supabase/client';

export interface AIGenerationRequest {
  type: 'overview' | 'project_description' | 'skills' | 'experience' | 'achievements';
  userProfile?: {
    name: string;
    role: string;
    experience?: string;
    education?: string;
  };
  projectData?: {
    title: string;
    category: string;
    technologies?: string[];
    description?: string;
  };
  existingContent?: string;
  context?: string;
}

export interface AIGenerationResponse {
  content: string;
  suggestions?: string[];
  confidence?: number;
}

class AITextService {
  private static instance: AITextService;
  private apiKey: string | null = null;

  private constructor() {
    // Initialize with API key from environment or Supabase
    this.initializeApiKey();
  }

  public static getInstance(): AITextService {
    if (!AITextService.instance) {
      AITextService.instance = new AITextService();
    }
    return AITextService.instance;
  }

  private async initializeApiKey() {
    try {
      // Try to get API key from Supabase secrets or environment
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();
      
      if (data) {
        this.apiKey = data.value;
      } else {
        // Fallback to environment variable
        this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
      }
    } catch (error) {
      console.warn('Could not load OpenAI API key:', error);
    }
  }

  public async generateText(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Use OpenRouter API for AI generation
    const apiKey = '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';
    
    if (!apiKey) {
      return this.getEnhancedFallbackContent(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173', // Optional: for tracking
          'X-Title': 'Resume Generator', // Optional: for tracking
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume writing assistant. Generate high-quality, ATS-friendly content for resumes. Be concise, professional, and use action verbs. Focus on achievements and impact.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim() || '';

      return {
        content,
        confidence: 0.9,
        suggestions: this.generateSuggestions(request.type, content)
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return this.getEnhancedFallbackContent(request);
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { type, userProfile, projectData, existingContent, context } = request;

    switch (type) {
      case 'overview':
        return `Write a professional resume summary/overview for:
Name: ${userProfile?.name || 'Student'}
Role: ${userProfile?.role || 'Student'}
Experience: ${userProfile?.experience || 'Recent graduate'}
Education: ${userProfile?.education || 'University student'}

Make it 2-3 sentences highlighting key strengths and career objectives. Be specific and impactful.`;

      case 'project_description':
        return `Write a compelling project description for a resume:
Project: ${projectData?.title || 'Project'}
Category: ${projectData?.category || 'Software'}
Technologies: ${projectData?.technologies?.join(', ') || 'Various technologies'}
Current Description: ${projectData?.description || 'None provided'}

Write 2-3 bullet points highlighting:
- What was built/achieved
- Technologies used
- Impact or results
- Key responsibilities

Use action verbs and quantify results when possible.`;

      case 'skills':
        return `Based on this profile, suggest 8-12 relevant technical and soft skills:
Name: ${userProfile?.name || 'Student'}
Role: ${userProfile?.role || 'Student'}
Experience: ${userProfile?.experience || 'Recent graduate'}
Context: ${context || 'General student profile'}

Include a mix of:
- Technical skills (programming languages, tools, frameworks)
- Soft skills (leadership, communication, problem-solving)
- Industry-specific skills

Format as a comma-separated list.`;

      case 'experience':
        return `Write 2-3 bullet points for a work experience entry:
Role: ${context || 'Position'}
Company: ${userProfile?.name || 'Organization'}
Duration: ${existingContent || 'Recent'}

Focus on:
- Key responsibilities
- Achievements and impact
- Skills demonstrated
- Quantifiable results

Use strong action verbs and be specific.`;

      case 'achievements':
        return `Write 3-5 achievement statements for a resume:
Context: ${context || 'Academic and professional achievements'}
Profile: ${userProfile?.name || 'Student'}

Include:
- Academic achievements
- Project accomplishments
- Leadership roles
- Awards or recognition
- Quantifiable results

Format as bullet points with action verbs.`;

      default:
        return `Generate professional resume content for: ${type}`;
    }
  }

  private getEnhancedFallbackContent(request: AIGenerationRequest): AIGenerationResponse {
    const { type, userProfile, projectData, additionalContext } = request;

    switch (type) {
      case 'overview':
        const department = userProfile?.education || userProfile?.department || 'Student';
        const name = userProfile?.name || 'Student';
        const role = userProfile?.role || 'Student';
        
        // Generate discipline-specific overviews
        let overviewContent = '';
        const dept = department.toLowerCase();
        
        if (dept.includes('computer') || dept.includes('software') || dept.includes('it')) {
          overviewContent = `Motivated ${department} student with strong technical foundation and hands-on project experience. Passionate about software development and eager to apply academic knowledge in real-world applications. Demonstrated ability to work collaboratively in team environments and deliver quality solutions.`;
        } else if (dept.includes('business') || dept.includes('management') || dept.includes('commerce')) {
          overviewContent = `Dedicated ${department} student with strong analytical skills and business acumen. Experienced in financial analysis, strategic planning, and team leadership. Eager to apply academic knowledge in dynamic business environments and contribute to organizational growth.`;
        } else if (dept.includes('engineering') && !dept.includes('software')) {
          overviewContent = `Ambitious ${department} student with solid foundation in engineering principles and practical problem-solving skills. Experienced in project management, technical analysis, and innovative design solutions. Committed to applying engineering expertise to real-world challenges.`;
        } else if (dept.includes('medicine') || dept.includes('medical') || dept.includes('health')) {
          overviewContent = `Compassionate ${department} student with strong foundation in medical sciences and patient care principles. Dedicated to healthcare excellence and committed to making a positive impact on patient outcomes through evidence-based practice.`;
        } else if (dept.includes('arts') || dept.includes('humanities') || dept.includes('english') || dept.includes('literature')) {
          overviewContent = `Creative and analytical ${department} student with excellent communication skills and critical thinking abilities. Experienced in research, writing, and cultural analysis. Passionate about applying humanities knowledge to address contemporary challenges.`;
        } else if (dept.includes('science') || dept.includes('physics') || dept.includes('chemistry') || dept.includes('biology')) {
          overviewContent = `Inquisitive ${department} student with strong analytical skills and scientific methodology expertise. Experienced in laboratory work, data analysis, and research. Committed to advancing scientific knowledge and applying research skills to solve complex problems.`;
        } else if (dept.includes('design') || dept.includes('graphic') || dept.includes('architecture')) {
          overviewContent = `Creative and innovative ${department} student with strong visual communication skills and design thinking expertise. Experienced in project development, client collaboration, and creative problem-solving. Passionate about creating impactful design solutions.`;
        } else {
          overviewContent = `Motivated ${department} student with strong academic foundation and diverse skill set. Experienced in research, analysis, and collaborative projects. Eager to apply academic knowledge in professional settings and contribute to meaningful work.`;
        }
        
        return {
          content: overviewContent,
          confidence: 0.8,
          suggestions: [
            'Highlight specific skills relevant to your field',
            'Mention relevant projects or experience',
            'Include career objectives'
          ]
        };

      case 'project_description':
        const projectTitle = projectData?.title || 'Project';
        const category = projectData?.category || 'Academic Project';
        const technologies = projectData?.technologies?.join(', ') || 'Relevant tools and methodologies';
        
        // Generate discipline-specific project descriptions
        let projectContent = '';
        const projCategory = category.toLowerCase();
        
        if (projCategory.includes('software') || projCategory.includes('web') || projCategory.includes('mobile')) {
          projectContent = `• Developed ${projectTitle} using ${technologies}\n• Implemented core functionality and user interface components\n• Collaborated with team members to ensure project delivery and quality standards\n• Applied best practices in ${category} development`;
        } else if (projCategory.includes('business') || projCategory.includes('management') || projCategory.includes('marketing')) {
          projectContent = `• Led ${projectTitle} focusing on ${technologies}\n• Conducted market research and competitive analysis\n• Developed strategic recommendations and implementation plans\n• Collaborated with stakeholders to achieve project objectives`;
        } else if (projCategory.includes('research') || projCategory.includes('analysis') || projCategory.includes('data')) {
          projectContent = `• Conducted comprehensive research on ${projectTitle}\n• Applied ${technologies} for data collection and analysis\n• Developed evidence-based conclusions and recommendations\n• Presented findings to academic and professional audiences`;
        } else if (projCategory.includes('design') || projCategory.includes('creative') || projCategory.includes('art')) {
          projectContent = `• Created ${projectTitle} using ${technologies}\n• Applied design principles and creative problem-solving\n• Collaborated with clients and team members throughout the creative process\n• Delivered innovative solutions that met project requirements`;
        } else if (projCategory.includes('engineering') || projCategory.includes('technical')) {
          projectContent = `• Designed and implemented ${projectTitle} using ${technologies}\n• Applied engineering principles and technical analysis\n• Conducted testing and validation of solutions\n• Documented processes and results for future reference`;
        } else {
          projectContent = `• Completed ${projectTitle} utilizing ${technologies}\n• Applied relevant methodologies and best practices\n• Collaborated with team members to achieve project goals\n• Delivered comprehensive results and documentation`;
        }
        
        return {
          content: projectContent,
          confidence: 0.8,
          suggestions: [
            'Add specific tools or methodologies used',
            'Include quantifiable results',
            'Highlight unique challenges solved'
          ]
        };

      case 'skills':
        // Generate skills based on context
        const skills = this.generateContextualSkills(additionalContext);
        return {
          content: skills.join(', '),
          confidence: 0.8,
          suggestions: [
            'Add industry-specific tools',
            'Include soft skills',
            'Mention certifications'
          ]
        };

      case 'experience':
        return {
          content: `• Performed key responsibilities in ${projectData?.title || 'role'}\n• Collaborated with team members to achieve project objectives\n• Contributed to successful project delivery and stakeholder satisfaction`,
          confidence: 0.7,
          suggestions: [
            'Add specific achievements',
            'Include quantifiable results',
            'Mention technologies used'
          ]
        };

      case 'achievements':
        return {
          content: `• Successfully completed ${projectData?.title || 'significant project'}\n• Demonstrated leadership and initiative in team projects\n• Achieved academic excellence and maintained high performance standards`,
          confidence: 0.7,
          suggestions: [
            'Add specific awards or recognition',
            'Include quantifiable achievements',
            'Mention impact or results'
          ]
        };

      default:
        return {
          content: 'Professional content will be generated here.',
          confidence: 0.5,
          suggestions: ['Customize this content', 'Add specific details', 'Include relevant examples']
        };
    }
  }

  private generateContextualSkills(context: any): string[] {
    const skills = new Set<string>();
    
    // Add skills based on projects
    if (context?.projects) {
      context.projects.forEach((project: any) => {
        if (project.technologies) {
          project.technologies.forEach((tech: string) => skills.add(tech));
        }
        if (project.category) {
          if (project.category.toLowerCase().includes('web')) {
            skills.add('Web Development');
            skills.add('HTML/CSS');
            skills.add('JavaScript');
          }
          if (project.category.toLowerCase().includes('mobile')) {
            skills.add('Mobile Development');
            skills.add('React Native');
          }
          if (project.category.toLowerCase().includes('data')) {
            skills.add('Data Analysis');
            skills.add('Python');
          }
        }
      });
    }

    // Add skills based on achievements
    if (context?.achievements) {
      context.achievements.forEach((achievement: any) => {
        if (achievement.title) {
          const title = achievement.title.toLowerCase();
          if (title.includes('react')) skills.add('React');
          if (title.includes('javascript')) skills.add('JavaScript');
          if (title.includes('python')) skills.add('Python');
          if (title.includes('java')) skills.add('Java');
          if (title.includes('aws')) skills.add('AWS');
          if (title.includes('machine learning')) skills.add('Machine Learning');
        }
      });
    }

    // Add skills based on certificates
    if (context?.certificates) {
      context.certificates.forEach((cert: any) => {
        if (cert.title) {
          const title = cert.title.toLowerCase();
          if (title.includes('react')) skills.add('React');
          if (title.includes('javascript')) skills.add('JavaScript');
          if (title.includes('python')) skills.add('Python');
          if (title.includes('aws')) skills.add('AWS');
          if (title.includes('cloud')) skills.add('Cloud Computing');
        }
      });
    }

    // Add default skills if none found
    if (skills.size === 0) {
      skills.add('JavaScript');
      skills.add('React');
      skills.add('Node.js');
      skills.add('Python');
      skills.add('Git');
      skills.add('Problem Solving');
      skills.add('Team Collaboration');
      skills.add('Communication');
    }

    return Array.from(skills).slice(0, 12); // Limit to 12 skills
  }

  private getFallbackContent(request: AIGenerationRequest): AIGenerationResponse {
    const { type, userProfile, projectData } = request;

    switch (type) {
      case 'overview':
        return {
          content: `Motivated ${userProfile?.role || 'student'} with strong technical skills and passion for innovation. Seeking opportunities to apply knowledge in real-world projects and contribute to meaningful solutions.`,
          confidence: 0.3,
          suggestions: [
            'Highlight specific technical skills',
            'Mention relevant projects or experience',
            'Include career objectives'
          ]
        };

      case 'project_description':
        return {
          content: `• Developed ${projectData?.title || 'project'} using modern technologies\n• Implemented core features and functionality\n• Collaborated with team members to deliver quality results`,
          confidence: 0.3,
          suggestions: [
            'Add specific technologies used',
            'Include quantifiable results',
            'Highlight unique challenges solved'
          ]
        };

      case 'skills':
        return {
          content: 'JavaScript, React, Node.js, Python, Git, Problem Solving, Teamwork, Communication, Project Management, Database Design, API Development, Testing',
          confidence: 0.3,
          suggestions: [
            'Add industry-specific tools',
            'Include soft skills',
            'Mention certifications or courses'
          ]
        };

      case 'experience':
        return {
          content: `• Performed key responsibilities in ${context || 'role'}\n• Collaborated with team members to achieve goals\n• Contributed to project success and deliverables`,
          confidence: 0.3,
          suggestions: [
            'Add specific achievements',
            'Include quantifiable results',
            'Mention technologies or tools used'
          ]
        };

      case 'achievements':
        return {
          content: `• Completed ${projectData?.title || 'significant project'}\n• Demonstrated leadership and initiative\n• Achieved academic or professional milestones`,
          confidence: 0.3,
          suggestions: [
            'Add specific awards or recognition',
            'Include quantifiable achievements',
            'Mention impact or results'
          ]
        };

      default:
        return {
          content: 'Professional content will be generated here.',
          confidence: 0.1,
          suggestions: ['Customize this content', 'Add specific details', 'Include relevant examples']
        };
    }
  }

  private generateSuggestions(type: string, content: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      overview: [
        'Add specific technical skills',
        'Include relevant experience',
        'Mention career goals'
      ],
      project_description: [
        'Quantify the impact or results',
        'Add specific technologies used',
        'Highlight unique challenges solved'
      ],
      skills: [
        'Include industry-specific tools',
        'Add soft skills',
        'Mention certifications'
      ],
      experience: [
        'Add quantifiable achievements',
        'Include specific responsibilities',
        'Mention technologies used'
      ],
      achievements: [
        'Add specific awards or recognition',
        'Include quantifiable results',
        'Mention impact or outcomes'
      ]
    };

    return suggestions[type] || ['Customize this content', 'Add specific details'];
  }

  public async isAvailable(): Promise<boolean> {
    await this.initializeApiKey();
    return this.apiKey !== null;
  }
}

export default AITextService;
