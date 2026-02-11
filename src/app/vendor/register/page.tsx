'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Globe,
  Clock,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

type Step = 1 | 2 | 3 | 4

interface FormData {
  // Step 1 - Account
  email: string
  password: string
  confirmPassword: string
  full_name: string
  phone: string
  // Step 2 - Business Info
  business_name: string
  business_type: string[]
  description: string
  slug: string
  // Step 3 - Address & Contact
  street: string
  city: string
  state: string
  country: string
  postal_code: string
  business_email: string
  business_phone: string
  website: string
  // Step 4 - Verification
  id_type: string
  id_number: string
  agree_terms: boolean
}

const BUSINESS_TYPES = [
  'Products',
  'Real Estate',
  'Automotive',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Services',
  'Food & Beverages',
]

const ID_TYPES = [
  'National ID',
  'Passport',
  'Driver\'s License',
  'Business Registration',
]

export default function VendorRegisterPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    business_name: '',
    business_type: [],
    description: '',
    slug: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    business_email: '',
    business_phone: '',
    website: '',
    id_type: '',
    id_number: '',
    agree_terms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const toggleBusinessType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      business_type: prev.business_type.includes(type)
        ? prev.business_type.filter(t => t !== type)
        : [...prev.business_type, type],
    }))
  }

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (currentStep === 1) {
      if (!user) {
        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = 'Invalid email address'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8)
          newErrors.password = 'Password must be at least 8 characters'
        if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = 'Passwords do not match'
      }
      if (!formData.full_name) newErrors.full_name = 'Full name is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }

    if (currentStep === 2) {
      if (!formData.business_name)
        newErrors.business_name = 'Business name is required'
      if (formData.business_type.length === 0)
        newErrors.business_type = 'Select at least one business type'
      if (!formData.description)
        newErrors.description = 'Business description is required'
      else if (formData.description.length < 20)
        newErrors.description = 'Description must be at least 20 characters'
    }

    if (currentStep === 3) {
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.state) newErrors.state = 'State is required'
      if (!formData.country) newErrors.country = 'Country is required'
    }

    if (currentStep === 4) {
      if (!formData.id_type) newErrors.id_type = 'ID type is required'
      if (!formData.id_number) newErrors.id_number = 'ID number is required'
      if (!formData.agree_terms) newErrors.agree_terms = 'You must accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4) as Step)
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1) as Step)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    try {
      let userId = user?.id

      // Step 1: Create account if not logged in
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            },
          },
        })

        if (authError) throw authError
        userId = authData.user?.id

        if (!userId) throw new Error('Failed to create account')

        // Create profile
        const { error: profileError } = await (supabase as any).from('profiles').upsert({
          id: userId,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'vendor',
          is_active: true,
          email_verified: false,
          metadata: {},
        })

        if (profileError) throw profileError
      } else {
        // Update existing profile to vendor role
        const profilesTable: any = supabase.from('profiles')
        const { error: profileError } = await profilesTable
          .update({ role: 'vendor' })
          .eq('id', userId)

        if (profileError) throw profileError
      }

      // Step 2: Create vendor record
      const slug = formData.slug || generateSlug(formData.business_name)

      const { error: vendorError } = await (supabase as any).from('vendors').insert({
        user_id: userId!,
        business_name: formData.business_name,
        business_type: formData.business_type,
        slug,
        description: formData.description,
        phone: formData.business_phone || formData.phone,
        email: formData.business_email || formData.email,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
        },
        business_hours: {},
        rating: 0,
        total_reviews: 0,
        total_sales: 0,
        verification_status: 'pending',
        verification_documents: {},
        kyc_data: {
          id_type: formData.id_type,
          id_number: formData.id_number,
        },
        is_active: true,
        is_suspended: false,
      })

      if (vendorError) throw vendorError

      toast.success('Vendor registration submitted! We will review your application shortly.')
      router.push('/vendor/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, label: 'Account', icon: User },
    { number: 2, label: 'Business', icon: Store },
    { number: 3, label: 'Address', icon: MapPin },
    { number: 4, label: 'Verify', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Store className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Become a Vendor
          </h1>
          <p className="text-gray-600 text-lg">
            Set up your store and start selling to millions of customers
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step > s.number
                      ? 'bg-green-500 text-white'
                      : step === s.number
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.number ? (
                    <Check size={20} />
                  ) : (
                    <s.icon size={20} />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step >= s.number ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 rounded mb-5 transition-all duration-300 ${
                    step > s.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Account Information</h2>
                <p className="text-gray-500">
                  {user
                    ? 'You are already signed in. Confirm your details below.'
                    : 'Create your account to get started.'}
                </p>
              </div>

              {user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <p className="text-green-800 text-sm font-medium">
                    Signed in as <span className="font-bold">{user.email}</span>
                  </p>
                </div>
              )}

              {!user && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => updateField('password', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition pr-10 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => updateField('confirmPassword', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Repeat password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={e => updateField('full_name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+234 800 123 4567"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Business Details</h2>
                <p className="text-gray-500">Tell us about your business</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={e => {
                      updateField('business_name', e.target.value)
                      updateField('slug', generateSlug(e.target.value))
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.business_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your Business Name"
                  />
                </div>
                {errors.business_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store URL
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                  <span className="bg-gray-100 px-4 py-3 text-gray-500 text-sm border-r">
                    mnk-marketplace.com/store/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => updateField('slug', generateSlug(e.target.value))}
                    className="flex-1 px-4 py-3 focus:outline-none"
                    placeholder="your-store"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type * <span className="text-gray-400 font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BUSINESS_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleBusinessType(type)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.business_type.includes(type)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {formData.business_type.includes(type) && (
                        <Check size={14} className="inline mr-1" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>
                {errors.business_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your business, what you sell, and what makes you unique..."
                />
                <div className="flex justify-between mt-1">
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                  <p className="text-gray-400 text-sm ml-auto">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Business Address & Contact</h2>
                <p className="text-gray-500">Where is your business located?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.street}
                    onChange={e => updateField('street', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Lagos"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => updateField('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Lagos State"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => updateField('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nigeria"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={e => updateField('postal_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    placeholder="100001"
                  />
                </div>
              </div>

              <hr className="my-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.business_email}
                      onChange={e => updateField('business_email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      placeholder="business@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData.business_phone}
                      onChange={e => updateField('business_phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      placeholder="+234 800 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website (optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => updateField('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Verification</h2>
                <p className="text-gray-500">
                  Help us verify your identity for a trusted marketplace
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Why verification?</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Verified vendors get a trust badge, higher visibility, and access to premium features. Your documents are stored securely.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Type *
                </label>
                <select
                  value={formData.id_type}
                  onChange={e => updateField('id_type', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-white ${
                    errors.id_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select ID type</option>
                  {ID_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.id_type && <p className="text-red-500 text-sm mt-1">{errors.id_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Number *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.id_number}
                    onChange={e => updateField('id_number', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                      errors.id_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your ID number"
                  />
                </div>
                {errors.id_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>
                )}
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Registration Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span className="text-gray-900 font-medium">{formData.full_name}</span>
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900 font-medium">{user?.email || formData.email}</span>
                  <span className="text-gray-500">Business:</span>
                  <span className="text-gray-900 font-medium">{formData.business_name}</span>
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-900 font-medium">
                    {formData.business_type.join(', ')}
                  </span>
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900 font-medium">
                    {[formData.city, formData.state, formData.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agree_terms}
                  onChange={e => updateField('agree_terms', e.target.checked)}
                  className="mt-1 w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-amber-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-amber-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  . I confirm that the information provided is accurate and I understand that my
                  application will be reviewed before activation.
                </span>
              </label>
              {errors.agree_terms && (
                <p className="text-red-500 text-sm">{errors.agree_terms}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg shadow-amber-200"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Already have account */}
        <p className="text-center text-gray-500 mt-6">
          Already a vendor?{' '}
          <Link href="/vendor/dashboard" className="text-amber-600 hover:underline font-semibold">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
