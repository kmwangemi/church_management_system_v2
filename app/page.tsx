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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Church className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">ChurchFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm">
              <Star className="h-4 w-4" />
              <span>Trusted by 1000+ Churches</span>
            </div>
          </div>
          <h1 className="mb-6 font-bold text-5xl text-gray-900">
            Complete Church Management
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-gray-600 text-xl">
            Streamline your church operations with our comprehensive management
            solution. Handle members, finances, events, assets, and spiritual
            growth all in one place.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button className="px-8" size="lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                className="bg-transparent px-8"
                size="lg"
                variant="outline"
              >
                View Demo
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl">
              Everything Your Church Needs
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              From member management to financial tracking, our platform
              provides all the tools you need to grow and manage your church
              effectively.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Complete member profiles with role-based access, attendance
                  tracking, and department organization
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <DollarSign className="mb-2 h-10 w-10 text-green-600" />
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>
                  Track tithes, offerings, pledges with mobile payment
                  integration including M-Pesa API
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <Calendar className="mb-2 h-10 w-10 text-purple-600" />
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Schedule services, meetings, and special events with RSVP
                  tracking and automated reminders
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-orange-600" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Comprehensive reports on attendance trends, giving patterns,
                  and church growth statistics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <MessageSquare className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>
                  SMS/Email alerts via Twilio & SendGrid, member notification
                  board, and announcement system
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <Heart className="mb-2 h-10 w-10 text-red-600" />
                <CardTitle>Discipleship Tracking</CardTitle>
                <CardDescription>
                  Track new converts, discipleship class progression, and
                  spiritual growth milestones
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-gray-600" />
                <CardTitle>Asset Management</CardTitle>
                <CardDescription>
                  Manage church assets including vehicles, schools, equipment
                  with maintenance scheduling
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <Church className="mb-2 h-10 w-10 text-indigo-600" />
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
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl">Loved by Church Leaders</h2>
            <p className="text-gray-600">
              See what pastors and administrators are saying about ChurchFlow
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center space-x-1">
                  {[...new Array(5)].map((_, i) => (
                    <Star
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "ChurchFlow has transformed how we manage our congregation.
                  The member management and financial tracking features are
                  exactly what we needed."
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Pastor John Smith</p>
                  <p className="text-gray-500 text-sm">
                    Grace Community Church
                  </p>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center space-x-1">
                  {[...new Array(5)].map((_, i) => (
                    <Star
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "The asset management feature helps us keep track of all our
                  church properties and vehicles. The maintenance scheduling is
                  a game-changer."
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-gray-500 text-sm">Church Administrator</p>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center space-x-1">
                  {[...new Array(5)].map((_, i) => (
                    <Star
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "The discipleship tracking and communication features have
                  helped us better connect with our members and track their
                  spiritual growth."
                </CardDescription>
                <div className="mt-4">
                  <p className="font-semibold">Bishop Michael Brown</p>
                  <p className="text-gray-500 text-sm">New Life Cathedral</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-blue-600 px-4 py-20 text-white">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 font-bold text-3xl">
            Ready to Transform Your Church Management?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-blue-100 text-xl">
            Join thousands of churches already using ChurchFlow to streamline
            operations and focus on what matters most - ministry.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button
                className="bg-white px-8 text-blue-600 hover:bg-gray-100"
                size="lg"
              >
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                className="border-white bg-transparent px-8 text-white hover:bg-white hover:text-blue-600"
                size="lg"
                variant="outline"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-white">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Church className="h-6 w-6" />
                <span className="font-bold text-xl">ChurchFlow</span>
              </div>
              <p className="mb-4 text-gray-400">
                Empowering churches with comprehensive management solutions for
                growth and ministry excellence.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Member Management</li>
                <li>Financial Tracking</li>
                <li>Event Planning</li>
                <li>Asset Management</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-gray-800 border-t pt-8 text-center text-gray-400">
            <p>© 2024 ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
