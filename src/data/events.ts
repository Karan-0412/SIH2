export type EventCategory = 'academic' | 'co_curricular';

export interface EventItem {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  date: string; // ISO string
  venue: string;
  organizer: string;
  bannerUrl: string;
}

export const initialEvents: EventItem[] = [
  {
    id: 'e-acad-ml-seminar',
    title: 'Machine Learning Research Seminar',
    shortDescription: 'Deep dive into cutting-edge ML research and applications.',
    description:
      'Join us for an in-depth seminar exploring recent advances in machine learning, including foundation models, efficient fine-tuning, and real-world deployment strategies. The session includes keynote talks, panel discussion, and live demos.',
    category: 'academic',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    venue: 'Auditorium A, Main Block',
    organizer: 'Dept. of Computer Science',
    bannerUrl:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'e-acad-math-colloq',
    title: 'Mathematics Colloquium',
    shortDescription: 'Talks by invited researchers on applied mathematics.',
    description:
      'An afternoon of stimulating talks in applied and pure mathematics. Topics include optimization, numerical methods, and dynamical systems, followed by an open Q&A and networking session.',
    category: 'academic',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    venue: 'Seminar Hall 2',
    organizer: 'Dept. of Mathematics',
    bannerUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'e-cc-hackathon',
    title: 'Campus Hackathon 2025',
    shortDescription: '24-hour coding marathon for innovative solutions.',
    description:
      'Compete in teams to build innovative solutions within 24 hours. Tracks include sustainability, education, and health-tech. Prizes for top teams and special awards for design and impact.',
    category: 'co_curricular',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    venue: 'Innovation Lab, Block C',
    organizer: 'Innovation Cell & ACM Student Chapter',
    bannerUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'e-cc-cultural-night',
    title: 'Cultural Night',
    shortDescription: 'An evening of music, dance, and art showcasing student talent.',
    description:
      'Experience a vibrant showcase of student performances across dance, music, theater, and art. Food stalls and photo booths will be available. Families are welcome.',
    category: 'co_curricular',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    venue: 'Open Air Theatre',
    organizer: 'Students’ Cultural Council',
    bannerUrl:
      'https://images.unsplash.com/photo-1515165562835-c3b8f7d92555?q=80&w=1600&auto=format&fit=crop',
  },
];
