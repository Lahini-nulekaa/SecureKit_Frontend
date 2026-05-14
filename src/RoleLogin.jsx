import React, { useState } from 'react';
import PatientDashboard from './PatientDashboard';
import DoctorLogin from './DoctorLogin';
import Login from './Login';

export default function RoleLogin({
	initialRole = 'patient',
	onNavigate,
	onPatientAuthChange,
	onDoctorSuccess,
	onAdminPasswordLogin,
}) {
	const [role, setRole] = useState(initialRole);

	const renderCurrentForm = () => {
		if (role === 'doctor') {
			return (
				<DoctorLogin
					onBack={() => onNavigate('home')}
					onSuccess={onDoctorSuccess}
				/>
			);
		}
		if (role === 'admin') {
			return (
				<Login
					onLogin={onAdminPasswordLogin}
					onCancel={() => onNavigate('home')}
				/>
			);
		}
		// Default: patient login (with 2FA support handled inside PatientDashboard)
		return <PatientDashboard onAuthChange={onPatientAuthChange} />;
	};

	const tabClasses = (active) =>
		'px-3 py-2 text-sm font-semibold rounded-md border ' +
		(active
			? 'bg-indigo-600 text-white border-indigo-600'
			: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50');

	return (
		<div className="max-w-3xl mx-auto">
			<div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 mb-4">
				<h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
				<p className="mt-1 text-sm text-slate-600">Choose your role and sign in to continue.</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<button type="button" className={tabClasses(role === 'patient')} onClick={() => setRole('patient')}>
						Patient
					</button>
					<button type="button" className={tabClasses(role === 'doctor')} onClick={() => setRole('doctor')}>
						Doctor
					</button>
					<button type="button" className={tabClasses(role === 'admin')} onClick={() => setRole('admin')}>
						Admin
					</button>
				</div>
			</div>

			{renderCurrentForm()}
		</div>
	);
}
