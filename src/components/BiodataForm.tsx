'use client';

/**
 * Comprehensive biodata collection form
 * Collects all required user profile information with validation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BiodataFormData {
  name: string;
  gender: 'MALE' | 'FEMALE' | '';
  age: string;
  height: string;
  city: string;
  regionId: string;
  education: string;
  occupation: string;
  religionLevel: string;
  aboutMe: string;
  lookingFor: string;
}

interface Region {
  id: string;
  name: string;
}

export default function BiodataForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [formData, setFormData] = useState<BiodataFormData>({
    name: '',
    gender: '',
    age: '',
    height: '',
    city: '',
    regionId: '',
    education: '',
    occupation: '',
    religionLevel: '',
    aboutMe: '',
    lookingFor: '',
  });

  // Fetch regions on component mount
  useEffect(() => {
    async function fetchRegions() {
      try {
        const res = await fetch('/api/regions');
        if (res.ok) {
          const data = await res.json();
          setRegions(data.regions || []);
        }
      } catch (err) {
        console.error('Failed to fetch regions:', err);
      }
    }
    fetchRegions();
  }, []);

  // Load existing biodata if available
  useEffect(() => {
    async function loadBiodata() {
      try {
        const res = await fetch('/api/biodata');
        if (res.ok) {
          const data = await res.json();
          if (data.biodata) {
            setFormData({
              name: data.biodata.name || '',
              gender: data.biodata.gender || '',
              age: data.biodata.age?.toString() || '',
              height: data.biodata.height?.toString() || '',
              city: data.biodata.city || '',
              regionId: data.biodata.regionId || '',
              education: data.biodata.education || '',
              occupation: data.biodata.occupation || '',
              religionLevel: data.biodata.religionLevel || '',
              aboutMe: data.biodata.aboutMe || '',
              lookingFor: data.biodata.lookingFor || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load biodata:', err);
      }
    }
    loadBiodata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setError('Please select gender');
      setLoading(false);
      return;
    }

    const age = parseInt(formData.age);
    if (!age || age < 18 || age > 100) {
      setError('Age must be between 18 and 100');
      setLoading(false);
      return;
    }

    const height = parseInt(formData.height);
    if (!height || height < 100 || height > 250) {
      setError('Height must be between 100 and 250 cm');
      setLoading(false);
      return;
    }

    if (!formData.city || formData.city.length < 2) {
      setError('Please enter your city');
      setLoading(false);
      return;
    }

    if (!formData.regionId) {
      setError('Please select your region');
      setLoading(false);
      return;
    }

    if (!formData.education) {
      setError('Please select education level');
      setLoading(false);
      return;
    }

    if (!formData.occupation) {
      setError('Please select occupation');
      setLoading(false);
      return;
    }

    if (!formData.religionLevel) {
      setError('Please select religion practice level');
      setLoading(false);
      return;
    }

    if (!formData.aboutMe || formData.aboutMe.length < 50) {
      setError('About me must be at least 50 characters');
      setLoading(false);
      return;
    }

    if (!formData.lookingFor || formData.lookingFor.length < 30) {
      setError('Looking for preferences must be at least 30 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/biodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          city: formData.city,
          regionId: formData.regionId,
          education: formData.education,
          occupation: formData.occupation,
          religionLevel: formData.religionLevel,
          aboutMe: formData.aboutMe,
          lookingFor: formData.lookingFor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save biodata');
      }

      // Redirect to photos page
      router.push('/photos');
    } catch (err: any) {
      setError(err.message || 'Failed to save biodata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age *
            </label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              min="18"
              max="100"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              id="height"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              min="100"
              max="250"
            />
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
            maxLength={100}
            placeholder="e.g., Jakarta, Bandung, Surabaya"
          />
        </div>

        <div>
          <label htmlFor="regionId" className="block text-sm font-medium text-gray-700 mb-1">
            Region *
          </label>
          <select
            id="regionId"
            value={formData.regionId}
            onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Professional & Education */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Education & Career</h2>

        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
            Education Level *
          </label>
          <select
            id="education"
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select education level</option>
            <option value="SMA/SMK">SMA/SMK</option>
            <option value="D3">D3 (Diploma)</option>
            <option value="S1">S1 (Bachelor)</option>
            <option value="S2">S2 (Master)</option>
            <option value="S3">S3 (Doctorate)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
            Occupation *
          </label>
          <select
            id="occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select occupation</option>
            <option value="Student">Student</option>
            <option value="Employee">Employee</option>
            <option value="Civil Servant">Civil Servant</option>
            <option value="Entrepreneur">Entrepreneur</option>
            <option value="Professional">Professional</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Religious Information */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Religious Practice</h2>

        <div>
          <label htmlFor="religionLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Religion Practice Level *
          </label>
          <select
            id="religionLevel"
            value={formData.religionLevel}
            onChange={(e) => setFormData({ ...formData, religionLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select practice level</option>
            <option value="Learning">Learning (Belajar)</option>
            <option value="Practicing">Practicing (Berusaha)</option>
            <option value="Committed">Committed (Istiqomah)</option>
            <option value="Very Religious">Very Religious (Sangat Religius)</option>
          </select>
        </div>
      </div>

      {/* About Me */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">About You</h2>

        <div>
          <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">
            About Me * (minimum 50 characters)
          </label>
          <textarea
            id="aboutMe"
            value={formData.aboutMe}
            onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            required
            minLength={50}
            maxLength={500}
            placeholder="Tell us about yourself, your personality, hobbies, and what makes you unique..."
          />
          <p className="text-xs text-gray-500 mt-1">{formData.aboutMe.length}/500 characters</p>
        </div>

        <div>
          <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
            What I'm Looking For * (minimum 30 characters)
          </label>
          <textarea
            id="lookingFor"
            value={formData.lookingFor}
            onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            required
            minLength={30}
            maxLength={500}
            placeholder="Describe your ideal partner, qualities you value, and what you're seeking in a relationship..."
          />
          <p className="text-xs text-gray-500 mt-1">{formData.lookingFor.length}/500 characters</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-soft"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
}
