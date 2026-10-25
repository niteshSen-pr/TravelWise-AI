import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Compass, Settings, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DestinationSection } from '../components/trip-builder/DestinationSection';
import { BudgetSection } from '../components/trip-builder/BudgetSection';
import { StyleSection } from '../components/trip-builder/StyleSection';
import { PreferencesSection } from '../components/trip-builder/PreferencesSection';
import { SummarySection } from '../components/trip-builder/SummarySection';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const CreateTripPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Set smart default dates (next week: 4 days)
  const today = new Date();
  const defaultStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    destination: 'Paris, France',
    starting_location: '',
    country: '',
    start_date: defaultStart,
    end_date: defaultEnd,
    traveler_count: 2,
    budget: 2000,
    currency: 'EUR',
    budget_category: 'moderate',
    travel_style: ['Cultural exploration', 'Couple', 'Food and culinary tourism'],
    pace: 'Balanced',
    food_preference: 'No preference',
    accommodation_type: 'Hotel',
    transport_preference: 'Mixed',
    accessibility: '',
    special_requests: '',
  });

  const [errors, setErrors] = useState({});

  const updateFormData = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    // Clear field-specific errors
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(patch).forEach((k) => delete copy[k]);
      return copy;
    });
  };

  const steps = [
    { number: 1, title: 'Destination', icon: MapPin },
    { number: 2, title: 'Budget', icon: DollarSign },
    { number: 3, title: 'Travel Style', icon: Compass },
    { number: 4, title: 'Preferences', icon: Settings },
    { number: 5, title: 'Review & Plan', icon: CheckCircle2 },
  ];

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.destination || formData.destination.trim().length < 2) {
        errs.destination = 'Please provide a valid destination city or region.';
      }
      if (!formData.start_date) {
        errs.start_date = 'Start date is required.';
      }
      if (!formData.end_date) {
        errs.end_date = 'End date is required.';
      }
      if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
        errs.end_date = 'End date cannot be earlier than start date.';
      }
    } else if (step === 2) {
      if (!formData.budget || Number(formData.budget) <= 0) {
        errs.budget = 'Please enter a positive budget amount.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toastError('Please check your input values before generating.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setGenerationError(null);

    try {
      const generatedItinerary = await api.generateItinerary(formData);
      
      // Store current itinerary and preferences in sessionStorage for immediate interactive review
      sessionStorage.setItem('current_itinerary', JSON.stringify(generatedItinerary));
      sessionStorage.setItem('current_preferences', JSON.stringify(formData));

      success('Itinerary generated successfully!');
      navigate('/itinerary');
    } catch (err) {
      console.error('Generation error:', err);
      setGenerationError(err.message || 'Failed to synthesize itinerary. Please try again.');
      toastError('Generation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & subtitle */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Smart Trip Builder</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Craft Your Personalized Itinerary
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Provide your destination parameters, pacing style, and budget preferences to synthesize your day-by-day plan.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.number);
                  }
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-brand-600 text-white'
                      : isCurrent
                      ? 'bg-white text-brand-600 ring-2 ring-brand-600 shadow-card'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                    isCurrent ? 'text-brand-700 font-bold' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 transition duration-300">
        {isSubmitting ? (
          <LoadingState
            title={`Generating ${formData.destination} Itinerary...`}
            message="Calculating routes, allocating budget across categories, and synthesizing activities."
          />
        ) : generationError ? (
          <ErrorMessage message={generationError} onRetry={handleGenerate} />
        ) : (
          <>
            {currentStep === 1 && (
              <DestinationSection formData={formData} updateFormData={updateFormData} errors={errors} />
            )}
            {currentStep === 2 && (
              <BudgetSection formData={formData} updateFormData={updateFormData} errors={errors} />
            )}
            {currentStep === 3 && (
              <StyleSection formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <PreferencesSection formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 5 && (
              <SummarySection
                formData={formData}
                isSubmitting={isSubmitting}
                onGenerate={handleGenerate}
              />
            )}

            {/* Step Navigation Buttons */}
            {currentStep < 5 && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition active:scale-95"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
