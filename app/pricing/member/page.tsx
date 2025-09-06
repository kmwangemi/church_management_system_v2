'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Church, Mail, Shield, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MembersPricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const plans = [
    {
      name: 'Connect',
      description: 'Perfect for new members',
      price: billingCycle === 'monthly' ? 0 : 0,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: false,
      features: [
        { name: 'Church directory access', included: true },
        { name: 'Event notifications', included: true },
        { name: 'Prayer request submissions', included: true },
        { name: 'Basic giving tools', included: true },
        { name: 'Email support', included: true },
        { name: 'Small group finder', included: false },
        { name: 'Advanced devotional content', included: false },
        { name: 'Ministry scheduling tools', included: false },
      ],
      buttonText: 'Join for Free',
      buttonStyle:
        'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
    },
    {
      name: 'Engage',
      description: 'For active members',
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: false,
      features: [
        { name: 'Full church directory', included: true },
        { name: 'Event registration', included: true },
        { name: 'Prayer circle participation', included: true },
        { name: 'Advanced giving & tithing', included: true },
        { name: 'Priority support', included: true },
        { name: 'Small group management', included: true },
        { name: 'Daily devotional content', included: true },
        { name: 'Ministry scheduling tools', included: false },
      ],
      buttonText: 'Start Engaging',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      name: 'Serve',
      description: 'Best value for ministry leaders',
      price: billingCycle === 'monthly' ? 19.99 : 199.99,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: true,
      savings: billingCycle === 'yearly' ? 'Save $39.89' : null,
      features: [
        { name: 'Complete church access', included: true },
        { name: 'Unlimited event management', included: true },
        { name: 'Lead prayer groups', included: true },
        { name: 'Advanced giving analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Create & manage groups', included: true },
        { name: 'Premium devotional library', included: true },
        { name: 'Ministry scheduling tools', included: true },
      ],
      buttonText: 'Start Serving',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    },
  ];
  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description:
        'Your personal information and giving history are protected with bank-level security',
    },
    {
      icon: Calendar,
      title: 'Cancel Anytime',
      description:
        'No long-term commitments. Upgrade or downgrade your membership anytime',
    },
  ];
  const faqs = [
    {
      question: 'How does the free membership work?',
      answer:
        'Start with our Connect plan at no cost. Access basic church features and community tools. Upgrade anytime to unlock premium content and advanced features.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.',
    },
    {
      question: 'Is my personal and giving data secure?',
      answer:
        'Absolutely. We use enterprise-grade encryption for all personal data and giving records. Your information is never shared with third parties and remains completely confidential.',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 shadow-sm backdrop-blur-md transition-colors duration-300 dark:bg-gray-900/90">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Church className="h-8 w-8 text-blue-600" />
              <div className="-top-1 -right-1 absolute h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
              ChurchHub
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/request-demo">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                Free Demo
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                className="hover:bg-blue-50 dark:hover:bg-gray-800"
                variant="ghost"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-5xl text-gray-900">
            Simple, Faithful <span className="text-blue-600">Membership</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-gray-600 text-xl">
            Choose the perfect membership level for your spiritual journey. All
            plans help you connect deeper with your faith community and grow in
            your walk with God.
          </p>
          {/* Billing Toggle */}
          <div className="mb-12 inline-flex items-center rounded-lg bg-gray-100 p-1">
            <button
              className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
              type="button"
            >
              Monthly
            </button>
            <button
              className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
              type="button"
            >
              Yearly
            </button>
          </div>
        </div>
        {/* Pricing Cards */}
        <div className="mb-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              className={`relative rounded-2xl border-2 bg-white shadow-lg transition-all hover:shadow-xl ${
                plan.popular
                  ? 'scale-105 border-blue-500 lg:scale-110'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              key={index}
            >
              {plan.popular && (
                <>
                  <div className="-top-4 -translate-x-1/2 absolute left-1/2 transform">
                    <span className="rounded-full bg-blue-600 px-4 py-1 font-medium text-sm text-white">
                      Most Popular
                    </span>
                  </div>
                  {plan.savings && (
                    <div className="-top-4 absolute right-4">
                      <span className="rounded-full bg-green-500 px-3 py-1 font-medium text-sm text-white">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="mb-2 font-bold text-2xl text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mb-4 text-gray-600">{plan.description}</p>
                  <div className="mb-1 flex items-baseline">
                    <span className="font-bold text-5xl text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-gray-600">{plan.period}</span>
                  </div>
                  {plan.price === 0 && (
                    <p className="text-gray-500 text-sm">
                      No credit card required
                    </p>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li className="flex items-start" key={featureIndex}>
                      <div className="mr-3 flex-shrink-0">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        {/* Features Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl text-gray-900">
            Everything you need for spiritual growth
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <div className="flex items-start space-x-4" key={index}>
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-bold text-3xl text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="mb-3 font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span className="font-bold text-xl">FaithConnect</span>
              </div>
              <p className="mb-4 text-gray-300">
                Connecting believers in meaningful community. Grow in your
                faith, serve others, and build lasting relationships with fellow
                members.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link className="text-gray-300 hover:text-white" href="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-300 hover:text-white"
                    href="/auth/login"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-gray-300">Member Support</span>
                </li>
                <li>
                  <Link className="text-gray-300 hover:text-white" href="/">
                    Prayer Requests
                  </Link>
                </li>
                <li>
                  <Link className="text-gray-300 hover:text-white" href="/">
                    Faith Resources
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-gray-700 border-t pt-8 md:flex-row">
            <p className="text-gray-400">
              © 2025 FaithConnect. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link className="text-gray-400 hover:text-white" href="/">
                Privacy Policy
              </Link>
              <Link className="text-gray-400 hover:text-white" href="/">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
