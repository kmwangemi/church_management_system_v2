import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Church,
  DollarSign,
  Heart,
  MessageSquare,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
      {/* Header */}
      <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Church className='h-8 w-8 text-blue-600' />
            <span className='text-2xl font-bold text-gray-900'>ChurchFlow</span>
          </div>
          <div className='flex items-center space-x-4'>
            <Link href='/auth/login'>
              <Button variant='ghost'>Sign In</Button>
            </Link>
            <Link href='/auth/signup'>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className='py-20 px-4'>
        <div className='container mx-auto text-center'>
          <div className='flex justify-center mb-6'>
            <div className='flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
              <Star className='h-4 w-4' />
              <span>Trusted by 1000+ Churches</span>
            </div>
          </div>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>
            Complete Church Management
            <span className='text-blue-600'> Made Simple</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            Streamline your church operations with our comprehensive management
            solution. Handle members, finances, events, assets, and spiritual
            growth all in one place.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/auth/signup'>
              <Button size='lg' className='px-8'>
                Start Free Trial
              </Button>
            </Link>
            <Link href='/demo'>
              <Button
                size='lg'
                variant='outline'
                className='px-8 bg-transparent'
              >
                View Demo
              </Button>
            </Link>
          </div>
          <div className='mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500'>
            <div className='flex items-center space-x-1'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span>No setup fees</span>
            </div>
            <div className='flex items-center space-x-1'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span>Cancel anytime</span>
            </div>
            <div className='flex items-center space-x-1'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>
              Everything Your Church Needs
            </h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              From member management to financial tracking, our platform
              provides all the tools you need to grow and manage your church
              effectively.
            </p>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <Users className='h-10 w-10 text-blue-600 mb-2' />
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Complete member profiles with role-based access, attendance
                  tracking, and department organization
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <DollarSign className='h-10 w-10 text-green-600 mb-2' />
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>
                  Track tithes, offerings, pledges with mobile payment
                  integration including M-Pesa API
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <Calendar className='h-10 w-10 text-purple-600 mb-2' />
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Schedule services, meetings, and special events with RSVP
                  tracking and automated reminders
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <BarChart3 className='h-10 w-10 text-orange-600 mb-2' />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Comprehensive reports on attendance trends, giving patterns,
                  and church growth statistics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <MessageSquare className='h-10 w-10 text-blue-600 mb-2' />
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>
                  SMS/Email alerts via Twilio & SendGrid, member notification
                  board, and announcement system
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <Heart className='h-10 w-10 text-red-600 mb-2' />
                <CardTitle>Discipleship Tracking</CardTitle>
                <CardDescription>
                  Track new converts, discipleship class progression, and
                  spiritual growth milestones
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <Shield className='h-10 w-10 text-gray-600 mb-2' />
                <CardTitle>Asset Management</CardTitle>
                <CardDescription>
                  Manage church assets including vehicles, schools, equipment
                  with maintenance scheduling
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <Church className='h-10 w-10 text-indigo-600 mb-2' />
                <CardTitle>Multi-Branch Support</CardTitle>
                <CardDescription>
                  Hierarchical structure for multiple church locations and
                  department management
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className='py-20 px-4'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>Loved by Church Leaders</h2>
            <p className='text-gray-600'>
              See what pastors and administrators are saying about ChurchFlow
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-1 mb-2'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>
                <CardDescription className='text-base'>
                  "ChurchFlow has transformed how we manage our congregation.
                  The member management and financial tracking features are
                  exactly what we needed."
                </CardDescription>
                <div className='mt-4'>
                  <p className='font-semibold'>Pastor John Smith</p>
                  <p className='text-sm text-gray-500'>
                    Grace Community Church
                  </p>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-1 mb-2'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>
                <CardDescription className='text-base'>
                  "The asset management feature helps us keep track of all our
                  church properties and vehicles. The maintenance scheduling is
                  a game-changer."
                </CardDescription>
                <div className='mt-4'>
                  <p className='font-semibold'>Sarah Johnson</p>
                  <p className='text-sm text-gray-500'>Church Administrator</p>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-1 mb-2'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>
                <CardDescription className='text-base'>
                  "The discipleship tracking and communication features have
                  helped us better connect with our members and track their
                  spiritual growth."
                </CardDescription>
                <div className='mt-4'>
                  <p className='font-semibold'>Bishop Michael Brown</p>
                  <p className='text-sm text-gray-500'>New Life Cathedral</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className='py-20 px-4 bg-blue-600 text-white'>
        <div className='container mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-6'>
            Ready to Transform Your Church Management?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join thousands of churches already using ChurchFlow to streamline
            operations and focus on what matters most - ministry.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/auth/signup'>
              <Button
                size='lg'
                className='px-8 bg-white text-blue-600 hover:bg-gray-100'
              >
                Start Your Free Trial
              </Button>
            </Link>
            <Link href='/contact'>
              <Button
                size='lg'
                variant='outline'
                className='px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent'
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 px-4'>
        <div className='container mx-auto'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <Church className='h-6 w-6' />
                <span className='text-xl font-bold'>ChurchFlow</span>
              </div>
              <p className='text-gray-400 mb-4'>
                Empowering churches with comprehensive management solutions for
                growth and ministry excellence.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Features</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>Member Management</li>
                <li>Financial Tracking</li>
                <li>Event Planning</li>
                <li>Asset Management</li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
