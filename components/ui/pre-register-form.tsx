'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';

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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Welcome aboard!
        </h3>
        <p className="text-gray-200 leading-relaxed">
          You're now on our exclusive early access list. We'll notify you as soon as v8n is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
      {/* Form Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Get Early Access
          </h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          Join our exclusive community of early adopters and help shape the future of AI development.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium text-sm">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/50 transition-all duration-300 h-12"
            placeholder="your@email.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium text-sm">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/50 transition-all duration-300 h-12"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-white font-medium text-sm">
              Company
            </Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/50 transition-all duration-300 h-12"
              placeholder="Your company"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="use_case" className="text-white font-medium text-sm">
            What would you like to build?
          </Label>
          <Textarea
            id="use_case"
            value={formData.use_case}
            onChange={(e) => handleInputChange('use_case', e.target.value)}
            className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/50 transition-all duration-300 resize-none"
            placeholder="Tell us about your project or use case..."
            rows={3}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-4 border border-red-500/30">
            <p className="text-red-300 text-sm">
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white font-semibold py-3 h-12 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Securing your spot...
            </>
          ) : (
            'Join Early Access'
          )}
        </Button>
      </form>
    </div>
  );
} 