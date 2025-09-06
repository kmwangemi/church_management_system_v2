'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Church, Heart, Mail, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ChurchPricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for small congregations',
      price: billingCycle === 'monthly' ? 0 : 0,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: false,
      features: [
        { name: 'Up to 100 members', included: true },
        { name: 'Basic member management', included: true },
        { name: 'Event scheduling', included: true },
        { name: 'Prayer request tracking', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced reporting', included: false },
        { name: 'Donation tracking', included: false },
        { name: 'Multi-location support', included: false },
      ],
      buttonText: 'Get Started Free',
      buttonStyle:
        'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
    },
    {
      name: 'Ministry',
      description: 'For growing churches',
      price: billingCycle === 'monthly' ? 29.99 : 299.99,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: false,
      features: [
        { name: 'Up to 500 members', included: true },
        { name: 'Advanced member management', included: true },
        { name: 'Event scheduling & registration', included: true },
        { name: 'Prayer request management', included: true },
        { name: 'Priority support', included: true },
        { name: 'Donation tracking', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Multi-location support', included: false },
      ],
      buttonText: 'Start Ministry Plan',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      name: 'Cathedral',
      description: 'Best value for large congregations',
      price: billingCycle === 'monthly' ? 79.99 : 799.99,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      popular: true,
      savings: billingCycle === 'yearly' ? 'Save $159.89' : null,
      features: [
        { name: 'Unlimited members', included: true },
        { name: 'Complete member management', included: true },
        { name: 'Advanced event management', included: true },
        { name: 'Prayer & pastoral care', included: true },
        { name: 'Priority support', included: true },
        { name: 'Advanced donation tracking', included: true },
        { name: 'Comprehensive reporting', included: true },
        { name: 'Multi-location support', included: true },
      ],
      buttonText: 'Start Cathedral Plan',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    },
  ];
  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        "Your congregation's data is encrypted and never shared with third parties",
    },
    {
      icon: Calendar,
      title: 'Cancel Anytime',
      description: 'No long-term contracts. Cancel your subscription anytime',
    },
  ];
  const faqs = [
    {
      question: 'How does the free trial work?',
      answer:
        'Start with our Basic plan at no cost. No credit card required. Upgrade anytime to unlock unlimited features and advanced member management tools.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, ACH transfers, and digital wallets through Stripe for secure processing.',
    },
    {
      question: "Is my congregation's data secure?",
      answer:
        'Absolutely. We use bank-level encryption and never store your payment information. Your member data is private and secure.',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            Simple, Transparent <span className="text-blue-600">Pricing</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-gray-600 text-xl">
            Choose the perfect plan for your ministry goals. All plans include
            our advanced church management and member engagement tools.
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
                <button
                  className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${plan.buttonStyle}`}
                  type="button"
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Features Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl text-gray-900">
            Everything you need to grow your ministry
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
                <Heart className="h-6 w-6" />
                <span className="font-bold text-xl">ChurchConnect</span>
              </div>
              <p className="mb-4 text-gray-300">
                AI-powered church management that helps you grow your ministry.
                Optimize your congregation management and stand out to new
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
                    href="/pricing/church"
                  >
                    Pricing
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
                  <span className="text-gray-300">Contact Support</span>
                </li>
                <li>
                  <Link className="text-gray-300 hover:text-white" href="/">
                    Feature Request
                  </Link>
                </li>
                <li>
                  <Link className="text-gray-300 hover:text-white" href="/">
                    Ministry Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-gray-700 border-t pt-8 md:flex-row">
            <p className="text-gray-400">
              © 2025 ChurchConnect. All rights reserved.
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
