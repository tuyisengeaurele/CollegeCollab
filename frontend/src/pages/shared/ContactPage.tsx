import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Mail, MapPin, Phone, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5, 'Subject too short'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});
type FormData = z.infer<typeof schema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    reset();
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F7]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-gradient font-bold text-lg">CollegeCollab</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-[#4A5878] hover:text-[#1A2744] font-medium">Sign in</Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 pt-28 pb-20"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#1E50A2]/10 text-[#1E50A2] rounded-full px-4 py-2 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in touch
          </div>
          <h1 className="text-5xl font-bold text-[#1A2744] mb-4">
            We'd love to <span className="text-gradient">hear from you</span>
          </h1>
          <p className="text-xl text-[#4A5878] max-w-2xl mx-auto">
            Have questions about CollegeCollab? We're here to help students, lecturers, and institutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/250780605880"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-6 bg-[#25D366] rounded-2xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Chat on WhatsApp</p>
                <p className="text-white/80 text-sm">+250 780 605 880</p>
                <p className="text-white/60 text-xs mt-0.5">Typically replies within hours</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            </motion.a>

            {/* Info cards */}
            {[
              { icon: Mail, label: 'Email Us', value: 'support@collegecollab.rw', sub: 'We reply within 24 hours' },
              { icon: Phone, label: 'Call Us', value: '+250 780 605 880', sub: 'Mon-Fri, 8am to 6pm EAT' },
              { icon: MapPin, label: 'Visit Us', value: 'Kigali, Rwanda', sub: 'University of Rwanda Campus' },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E2E8F7] shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]"
              >
                <div className="w-12 h-12 bg-[#1E50A2]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#1E50A2]" />
                </div>
                <div>
                  <p className="text-xs text-[#8896B3] font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-[#1A2744] mt-0.5">{item.value}</p>
                  <p className="text-xs text-[#8896B3]">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E2E8F7] shadow-[0_2px_16px_0_rgba(30,80,162,0.08)] p-8">
              <h2 className="text-xl font-bold text-[#1A2744] mb-2">Send us a message</h2>
              <p className="text-sm text-[#4A5878] mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full name"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="How can we help you?"
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us more about your question or feedback..."
                    className="w-full bg-white border border-[#E2E8F7] rounded-xl px-4 py-3 text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:ring-2 focus:ring-[#1E50A2]/20 transition-all resize-none"
                    {...register('message')}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>

                <Button type="submit" size="lg" fullWidth loading={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants} className="mt-16">
          <h2 className="text-2xl font-bold text-[#1A2744] text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: 'Is CollegeCollab free for students?', a: 'Yes, CollegeCollab is free for all students enrolled through their institution.' },
              { q: 'How do I get my institution onboarded?', a: 'Contact us via WhatsApp or the form above and our team will guide you through the process.' },
              { q: 'Can I use CollegeCollab on mobile?', a: 'Absolutely! CollegeCollab is fully responsive and works perfectly on all devices.' },
              { q: 'Is student data secure?', a: 'Yes, we use industry-standard encryption and follow strict data privacy policies.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -1 }}
                className="p-6 bg-white rounded-2xl border border-[#E2E8F7] shadow-[0_2px_16px_0_rgba(30,80,162,0.06)]"
              >
                <h3 className="font-semibold text-[#1A2744] mb-2">{faq.q}</h3>
                <p className="text-sm text-[#4A5878] leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
