import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Platform Integrations</h1>
        <Card>
          <CardHeader>
            <CardTitle>Connect your platforms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Configure API keys or OAuth for platforms like LeetCode, Codeforces, HackerRank, GFG, and more.</p>
            <ul className="list-disc pl-6">
              <li>Auto-sync pulls your progress periodically.</li>
              <li>You can disable auto-sync and update progress manually.</li>
              <li>OAuth is recommended where available.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IntegrationsPage;
