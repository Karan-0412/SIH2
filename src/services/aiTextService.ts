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
    if (!this.apiKey) {
      return this.getFallbackContent(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
        throw new Error(`OpenAI API error: ${response.status}`);
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
      return this.getFallbackContent(request);
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
