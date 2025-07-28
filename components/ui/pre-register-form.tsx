'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PreRegisterFormData {
  email: string;
  name: string;
  company: string;
  use_case: string;
}

export function PreRegisterForm() {
  const [formData, setFormData] = useState<PreRegisterFormData>({
    email: '',
    name: '',
    company: '',
    use_case: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/pre-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setIsSuccess(true);
      setFormData({ email: '', name: '', company: '', use_case: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PreRegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Thank you for pre-registering!
          </h3>
          <p className="text-gray-300">
            We'll notify you when v8n is ready for early access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Get Early Access
        </CardTitle>
        <CardDescription className="text-gray-300">
          Be among the first to experience AI-powered application building
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-white">
              Company
            </Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Your company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="use_case" className="text-white">
              Use Case
            </Label>
            <Textarea
              id="use_case"
              value={formData.use_case}
              onChange={(e) => handleInputChange('use_case', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
              placeholder="What would you like to build with v8n?"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black hover:bg-gray-100 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Pre-register for Early Access'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 