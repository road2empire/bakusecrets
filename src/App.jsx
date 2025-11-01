import { useState, useEffect, useRef } from 'react'
import './App.css'
import ApplicationForm from './ApplicationForm'
import { MapPin, MessageCircle, Clock } from 'lucide-react'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStickyCTAVisible, setIsStickyCTAVisible] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const heroSectionRef = useRef(null)

  // Handle scroll for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      if (window.scrollY > heroHeight - 100) {
        setIsStickyCTAVisible(true)
      } else {
        setIsStickyCTAVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase(prev => (prev + 1) % 3)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Lazy load hero video using Intersection Observer
  useEffect(() => {
    const heroSection = heroSectionRef.current
    if (!heroSection) return

    let observer = null
    let fallbackTimer = null

    const loadVideo = () => {
      setShouldLoadVideo(true)
      if (observer) {
        observer.disconnect()
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Load video when hero section enters viewport (even slightly)
          if (entry.isIntersecting) {
            loadVideo()
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px' // Start loading slightly before it's fully visible
      }
    )

    observer.observe(heroSection)

    // Fallback: Load video after 300ms if still not intersecting
    // (handles edge cases where hero is immediately visible)
    fallbackTimer = setTimeout(() => {
      loadVideo()
    }, 300)

    return () => {
      if (observer) {
        observer.disconnect()
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
      }
    }
  }, []) // Run only once on mount

  const handleCTAClick = (e) => {
    e.preventDefault()
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'auto'
  }

  const handleFormSubmit = (formData) => {
    console.log('Form submitted with data:', formData)
    // Here you would typically send the data to your backend
    // For now, we'll just log it to the console
  }

  const handleDotClick = (index) => {
    setCurrentPhase(index)
  }

  return (
    <div className="App">
      {/* Hero Section */}
      <section className="hero" ref={heroSectionRef}>
        <video 
          className="hero-video" 
          autoPlay 
          muted 
          loop 
          playsInline
          preload="none"
        >
          {shouldLoadVideo && (
            <source src="/baku-night.mp4" type="video/mp4" />
          )}
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1><strong>BAKU SECRET SOCIETY<br /><span className="inaugural-highlight">INAUGURAL NIGHT</span></strong></h1>
            <p>AN INVITATION-ONLY GATHERING FOR BAKU'S INTERNATIONAL ELITE</p>
            <div className="hero-mask-mobile">
              <img src="/1400x800-mask.png" alt="Elegant mask" />
            </div>
            <div className="hero-requirements">
              <ul>
                <li>Location revealed upon invitation</li>
                <li>International people based in Baku</li>
                <li>English speaking conversation</li>
                <li>Sophisticated, like-minded people</li>
                <li>Elegant evening wear</li>
              </ul>
            </div>
            <div className="hero-cta-section">
              <div className="hero-urgency">LAST TICKETS REMAINING</div>
              <button onClick={handleCTAClick} className="cta-button">Request Invitation</button>
            </div>
          </div>
          <div className="hero-mask">
            <img src="/1400x800-mask.png" alt="Elegant mask" />
          </div>
        </div>
      </section>

      {/* What Awaits Section */}
      <section className="what-awaits">
        <h2 className="section-title"><strong>THE EVENING <span className="section-highlight">UNFOLDS</span></strong></h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-time">7:00 PM</div>
            <div className="timeline-content">
              <h3>CURATED CONNECTIONS</h3>
              <p>Pre-matched international professionals. Champagne welcome. Personal introductions by your host.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">8:30 PM</div>
            <div className="timeline-content">
              <h3>ELEGANT DINING</h3>
              <p>Long banquet table. International cuisine. Conversations deepen over candlelight and wine.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">10:00 PM</div>
            <div className="timeline-content">
              <h3>THE ENERGY SHIFT</h3>
              <p>DJ takes control. Tables cleared. Open bar flows. Dancing until the early hours begins.</p>
            </div>
          </div>
        </div>
        
      </section>

      {/* Premium Catering & Venue */}
      <section className="experience">
        <h2 className="section-title"><strong>CURATED <span className="section-highlight">EXPERIENCE</span></strong></h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-time">VENUE</div>
            <div className="timeline-content">
              <h3>ROOFTOP SANCTUARY</h3>
              <p>Exclusive terrace overlooking Baku's skyline. Floor-to-ceiling windows. Ambient lighting that transforms with the evening's energy.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">CUISINE</div>
            <div className="timeline-content">
              <h3>ARTISAN MENU</h3>
              <p>Carefully crafted canapés and elevated comfort dishes. International flavors with local influences. Each plate designed for conversation and connection.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">LIBATIONS</div>
            <div className="timeline-content">
              <h3>PREMIUM BAR</h3>
              <p>Curated selection of fine spirits and craft cocktails. Champagne service throughout. Signature drinks crafted by professional mixologists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta" id="apply">
        <button onClick={handleCTAClick} className="cta-button">Submit Application</button>
        <p className="disclaimer">Applications reviewed individually. Selected guests contacted within 48 hours.<br />100 AZN per ticket upon approval.</p>
      </section>

      {/* Sticky CTA */}
      <div className={`sticky-cta ${isStickyCTAVisible ? 'visible' : ''}`}>
        <div className="sticky-urgency">LAST TICKETS REMAINING</div>
        <button onClick={handleCTAClick} className="cta-button">Request Invitation</button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal active" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ApplicationForm 
              onClose={handleCloseModal}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
