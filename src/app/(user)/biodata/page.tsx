/**
 * Biodata collection page
 * Allows users to complete their profile information
 */

import BiodataForm from '@/components/BiodataForm';

export default function BiodataPage() {
  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600">
          Please fill in all required information. Your profile will be reviewed by a supervisor
          before you can start using the platform.
        </p>
      </div>

      <BiodataForm />
    </div>
  );
}
