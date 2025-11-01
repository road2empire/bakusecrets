import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import './ApplicationForm.css'

const ApplicationForm = ({ onClose, onSubmit, isNoFeeVariant = false }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    nationality: '',
    englishFluent: '',
    profession: '',
    timeInBaku: '',
    reasonInBaku: '',
    interests: [],
    instagram: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalSteps = 14

  const updateProgress = () => {
    // Don't show progress bar on intro page (step 0)
    if (currentStep === 0) return 0
    return ((currentStep - 1) / (totalSteps - 1)) * 100
  }

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCheckboxChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }))
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    switch (stepNumber) {
      case 0:
        // Intro page, no validation needed
        break
      case 1:
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Please enter your full name'
        }
        break
      case 2:
        if (!formData.email.trim()) {
          newErrors.email = 'Please enter a valid email'
        } else if (!formData.email.includes('@')) {
          newErrors.email = 'Please enter a valid email'
        }
        break
      case 3:
        if (!formData.phone.trim()) {
          newErrors.phone = 'Please enter your phone number'
        }
        break
      case 4:
        if (!formData.age) {
          newErrors.age = 'Please select your age'
        } else {
          const ageNum = parseInt(formData.age)
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
            newErrors.age = 'Please enter a valid age between 18 and 65'
          }
        }
        break
      case 5:
        if (!formData.gender) {
          newErrors.gender = 'Please select an option'
        }
        break
      case 6:
        if (!formData.nationality.trim()) {
          newErrors.nationality = 'Please enter your nationality'
        }
        break
      case 7:
        if (!formData.englishFluent) {
          newErrors.englishFluent = 'Please select an option'
        }
        break
      case 8:
        if (!formData.profession.trim()) {
          newErrors.profession = 'Please enter your profession'
        }
        break
      case 9:
        if (!formData.timeInBaku) {
          newErrors.timeInBaku = 'Please select a duration'
        }
        break
      case 10:
        if (!formData.reasonInBaku) {
          newErrors.reasonInBaku = 'Please select a reason'
        }
        break
      case 11:
        if (formData.interests.length === 0) {
          newErrors.interests = 'Please select at least one interest'
        }
        break
      case 12:
        // Instagram is optional, no validation needed
        break
      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    // Skip validation for intro page (step 0) and optional Instagram step (step 12)
    if (currentStep !== 0 && currentStep !== 12) {
      if (!validateStep(currentStep)) {
        return
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Only allow Enter to submit on the final step (step 13)
      if (currentStep === 13) {
        handleSubmit(e)
      } else {
        // For all other steps, treat Enter as "Continue"
        nextStep()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only allow submission on the final step
    if (currentStep !== 13) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Send data to API endpoint
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit application')
      }

      console.log('Application Data:', formData)
      
      setIsSubmitted(true)
      
      // Track Facebook Pixel ApplicationSubmitted event for application submission
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ApplicationSubmitted', {
          value: 100,
          currency: 'AZN',
        })
      }
      
      // Notify parent component
      if (onSubmit) {
        onSubmit(formData)
      }
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setCurrentStep(0)
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          age: '',
          gender: '',
          nationality: '',
          englishFluent: '',
          profession: '',
          timeInBaku: '',
          reasonInBaku: '',
          interests: [],
          instagram: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError(error.message || 'Failed to submit application. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="form-container">
        <div className="success-message active">
          <h2>APPLICATION SUBMITTED</h2>
          <p>Thank you for your interest.<br/>We'll be in touch within 48 hours if your profile matches our evening.<br/><br/>Check your email and WhatsApp.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-container">
      {currentStep > 1 && (
        <button 
          type="button" 
          className="back-arrow" 
          onClick={prevStep}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      
      {currentStep > 0 && (
        <div className="progress-bar" style={{ width: `${updateProgress()}%` }}></div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Step 0: Introduction & Quality Filter */}
        {currentStep === 0 && (
          <div className="form-step active intro-step">
            <div className="intro-content">
              <h2 className="intro-title">BAKU SECRET SOCIETY</h2>
              <div className="intro-subtitle">INAUGURAL NIGHT</div>
              
              <div className="intro-message">
                
                {!isNoFeeVariant && (
                  <div className="price-notice">
                    <div className="price-highlight">
                      <div className="price-conditions">
                        <span className="condition-line">You pay only if selected</span>
                        <span className="condition-line">All-inclusive evening</span>
                      </div>
                      <div className="price-amount-section">
                        <span className="price-amount">100 AZN</span>
                        <span className="price-text">per plate</span>
                      </div>
                    </div>
                    
                    <div className="price-details">
                      <div className="price-includes">
                        <h4>Your investment includes:</h4>
                        <ul>
                          <li>Premium venue & atmosphere</li>
                          <li>Artisan cuisine & craft cocktails</li>
                          <li>Curated entertainment</li>
                          <li>Meeting with like-minded internationals</li>
                        </ul>
                      </div>
                      
                      <div className="priceless-value">
                        <span className="priceless-text">The connections you'll make?</span>
                        <span className="priceless-emphasis">Priceless.</span>
                      </div>
                    </div>
                  </div>
                )}
                  
                  <p className="quality-filter">
                    {isNoFeeVariant 
                      ? "We seek serious individuals who value premium experiences and meaningful connections."
                      : "If this investment feels excessive, this evening may not align with your expectations. We seek serious individuals who value premium experiences and meaningful connections."
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="button-group intro-buttons">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Not for me
              </button>
            </div>
            
            {/* Sticky interested button for intro page */}
            <div className="sticky-intro-button">
              <button type="button" className="btn btn-primary intro-sticky-btn" onClick={nextStep}>
                Yes, I'm interested
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Full Name */}
        {currentStep === 1 && (
          <div className="form-step active">
            <label className="question-label">YOUR FULL NAME</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your full name" 
            />
            {errors.fullName && <div className="error-message show">{errors.fullName}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Email */}
        {currentStep === 2 && (
          <div className="form-step active">
            <label className="question-label">EMAIL ADDRESS</label>
            <input 
              type="email" 
              className="input-field" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="your.email@example.com" 
            />
            {errors.email && <div className="error-message show">{errors.email}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Phone */}
        {currentStep === 3 && (
          <div className="form-step active">
            <label className="question-label">WHATSAPP NUMBER</label>
            <input 
              type="tel" 
              className="input-field" 
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="+994 XX XXX XX XX" 
            />
            {errors.phone && <div className="error-message show">{errors.phone}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Age */}
        {currentStep === 4 && (
          <div className="form-step active">
            <label className="question-label">AGE</label>
            <div className="age-slider-container">
              <input 
                type="range" 
                min="18" 
                max="65" 
                value={formData.age || 25} 
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="age-slider"
              />
              <div className="age-display">
                <span className="age-value">{formData.age || 25}</span>
                <span className="age-unit">years old</span>
              </div>
              <div className="age-range-labels">
                <span>18</span>
                <span>65</span>
              </div>
            </div>
            {errors.age && <div className="error-message show">{errors.age}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 5: Gender */}
        {currentStep === 5 && (
          <div className="form-step active">
            <label className="question-label">GENDER</label>
            <div className="radio-group">
              {['Male', 'Female', 'Prefer not to say'].map((option) => (
                <label key={option} className="radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.gender && <div className="error-message show">{errors.gender}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 6: Nationality */}
        {currentStep === 6 && (
          <div className="form-step active">
            <label className="question-label">NATIONALITY</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your nationality" 
            />
            <p className="field-description">
              This evening is designed for international community based in Baku. Your nationality helps us ensure a diverse, global mix of like-minded individuals.
            </p>
            {errors.nationality && <div className="error-message show">{errors.nationality}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 7: English Fluency */}
        {currentStep === 7 && (
          <div className="form-step active">
            <label className="question-label">DO YOU SPEAK ENGLISH FLUENTLY?</label>
            <div className="radio-group">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="radio-label">
                  <input 
                    type="radio" 
                    name="englishFluent" 
                    value={option}
                    checked={formData.englishFluent === option}
                    onChange={(e) => handleInputChange('englishFluent', e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.englishFluent && <div className="error-message show">{errors.englishFluent}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 8: Profession */}
        {currentStep === 8 && (
          <div className="form-step active">
            <label className="question-label">CURRENT PROFESSION</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you do?" 
            />
            <p className="field-description">
              We seek sophisticated professionals who value meaningful connections. Understanding your background helps us curate conversations among like-minded individuals.
            </p>
            {errors.profession && <div className="error-message show">{errors.profession}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 9: Time in Baku */}
        {currentStep === 9 && (
          <div className="form-step active">
            <label className="question-label">HOW LONG HAVE YOU BEEN IN BAKU?</label>
            <div className="radio-group">
              {['Less than 6 months', '6-12 months', '1-2 years', '2+ years'].map((option) => (
                <label key={option} className="radio-label">
                  <input 
                    type="radio" 
                    name="timeInBaku" 
                    value={option}
                    checked={formData.timeInBaku === option}
                    onChange={(e) => handleInputChange('timeInBaku', e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.timeInBaku && <div className="error-message show">{errors.timeInBaku}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 10: Reason in Baku */}
        {currentStep === 10 && (
          <div className="form-step active">
            <label className="question-label">WHAT BRINGS YOU TO BAKU?</label>
            <div className="radio-group">
              {['Work', 'Business', 'Relocation', 'Other'].map((option) => (
                <label key={option} className="radio-label">
                  <input 
                    type="radio" 
                    name="reasonInBaku" 
                    value={option}
                    checked={formData.reasonInBaku === option}
                    onChange={(e) => handleInputChange('reasonInBaku', e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.reasonInBaku && <div className="error-message show">{errors.reasonInBaku}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 11: Interests */}
        {currentStep === 11 && (
          <div className="form-step active">
            <label className="question-label">WHAT INTERESTS YOU ABOUT THIS EVENING?</label>
            <div className="checkbox-group">
              {[
                'Meeting international community',
                'Experiencing Baku\'s premium scene',
                'Expanding my network',
                'Exclusive cultural experience'
              ].map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={(e) => handleCheckboxChange('interests', interest, e.target.checked)}
                  />
                  {interest}
                </label>
              ))}
            </div>
            {errors.interests && <div className="error-message show">{errors.interests}</div>}
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 12: Instagram */}
        {currentStep === 12 && (
          <div className="form-step active">
            <div className="question-label-container">
              <label className="question-label">INSTAGRAM HANDLE</label>
              <span className="optional-tag">(OPTIONAL)</span>
            </div>
            <input 
              type="text" 
              className="input-field" 
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="@yourusername" 
            />
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 13: Review & Submit */}
        {currentStep === 13 && (
          <div className="form-step active">
            <label className="question-label">READY TO SUBMIT YOUR APPLICATION?</label>
            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '20px' }}>
              We'll review your application and contact you within 48 hours if selected.
            </p>
            {submitError && (
              <div className="error-message show" style={{ marginBottom: '20px' }}>
                {submitError}
              </div>
            )}
            <div className="button-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default ApplicationForm
