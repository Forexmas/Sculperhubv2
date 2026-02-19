import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, KYCStatus } from '../types';
import { submitKYC } from '../services/mockBackend';
import { CheckCircle, AlertCircle, Clock, Upload, ChevronRight, User as UserIcon, Shield, FileText, X, Briefcase, DollarSign, Wallet, Hash, Mail, Phone } from 'lucide-react';

interface KYCModuleProps {
  user: User;
  refreshUser: () => void;
}

// Comprehensive list of countries with Dial Codes
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', dialCode: '+93' }, { code: 'AL', name: 'Albania', dialCode: '+355' }, { code: 'DZ', name: 'Algeria', dialCode: '+213' }, 
  { code: 'AS', name: 'American Samoa', dialCode: '+1-684' }, { code: 'AD', name: 'Andorra', dialCode: '+376' }, { code: 'AO', name: 'Angola', dialCode: '+244' }, 
  { code: 'AI', name: 'Anguilla', dialCode: '+1-264' }, { code: 'AQ', name: 'Antarctica', dialCode: '+672' }, { code: 'AG', name: 'Antigua and Barbuda', dialCode: '+1-268' }, 
  { code: 'AR', name: 'Argentina', dialCode: '+54' }, { code: 'AM', name: 'Armenia', dialCode: '+374' }, { code: 'AW', name: 'Aruba', dialCode: '+297' }, 
  { code: 'AU', name: 'Australia', dialCode: '+61' }, { code: 'AT', name: 'Austria', dialCode: '+43' }, { code: 'AZ', name: 'Azerbaijan', dialCode: '+994' }, 
  { code: 'BS', name: 'Bahamas', dialCode: '+1-242' }, { code: 'BH', name: 'Bahrain', dialCode: '+973' }, { code: 'BD', name: 'Bangladesh', dialCode: '+880' }, 
  { code: 'BB', name: 'Barbados', dialCode: '+1-246' }, { code: 'BY', name: 'Belarus', dialCode: '+375' }, { code: 'BE', name: 'Belgium', dialCode: '+32' }, 
  { code: 'BZ', name: 'Belize', dialCode: '+501' }, { code: 'BJ', name: 'Benin', dialCode: '+229' }, { code: 'BM', name: 'Bermuda', dialCode: '+1-441' }, 
  { code: 'BT', name: 'Bhutan', dialCode: '+975' }, { code: 'BO', name: 'Bolivia', dialCode: '+591' }, { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387' }, 
  { code: 'BW', name: 'Botswana', dialCode: '+267' }, { code: 'BR', name: 'Brazil', dialCode: '+55' }, { code: 'BN', name: 'Brunei Darussalam', dialCode: '+673' }, 
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' }, { code: 'BF', name: 'Burkina Faso', dialCode: '+226' }, { code: 'BI', name: 'Burundi', dialCode: '+257' }, 
  { code: 'KH', name: 'Cambodia', dialCode: '+855' }, { code: 'CM', name: 'Cameroon', dialCode: '+237' }, { code: 'CA', name: 'Canada', dialCode: '+1' }, 
  { code: 'CV', name: 'Cape Verde', dialCode: '+238' }, { code: 'KY', name: 'Cayman Islands', dialCode: '+1-345' }, { code: 'CF', name: 'Central African Republic', dialCode: '+236' }, 
  { code: 'TD', name: 'Chad', dialCode: '+235' }, { code: 'CL', name: 'Chile', dialCode: '+56' }, { code: 'CN', name: 'China', dialCode: '+86' }, 
  { code: 'CO', name: 'Colombia', dialCode: '+57' }, { code: 'KM', name: 'Comoros', dialCode: '+269' }, { code: 'CG', name: 'Congo', dialCode: '+242' }, 
  { code: 'CD', name: 'Congo, Democratic Republic', dialCode: '+243' }, { code: 'CK', name: 'Cook Islands', dialCode: '+682' }, { code: 'CR', name: 'Costa Rica', dialCode: '+506' }, 
  { code: 'CI', name: 'Cote D\'Ivoire', dialCode: '+225' }, { code: 'HR', name: 'Croatia', dialCode: '+385' }, { code: 'CU', name: 'Cuba', dialCode: '+53' }, 
  { code: 'CY', name: 'Cyprus', dialCode: '+357' }, { code: 'CZ', name: 'Czech Republic', dialCode: '+420' }, { code: 'DK', name: 'Denmark', dialCode: '+45' }, 
  { code: 'DJ', name: 'Djibouti', dialCode: '+253' }, { code: 'DM', name: 'Dominica', dialCode: '+1-767' }, { code: 'DO', name: 'Dominican Republic', dialCode: '+1-809' }, 
  { code: 'EC', name: 'Ecuador', dialCode: '+593' }, { code: 'EG', name: 'Egypt', dialCode: '+20' }, { code: 'SV', name: 'El Salvador', dialCode: '+503' }, 
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240' }, { code: 'ER', name: 'Eritrea', dialCode: '+291' }, { code: 'EE', name: 'Estonia', dialCode: '+372' }, 
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' }, { code: 'FJ', name: 'Fiji', dialCode: '+679' }, { code: 'FI', name: 'Finland', dialCode: '+358' }, 
  { code: 'FR', name: 'France', dialCode: '+33' }, { code: 'GA', name: 'Gabon', dialCode: '+241' }, { code: 'GM', name: 'Gambia', dialCode: '+220' }, 
  { code: 'GE', name: 'Georgia', dialCode: '+995' }, { code: 'DE', name: 'Germany', dialCode: '+49' }, { code: 'GH', name: 'Ghana', dialCode: '+233' }, 
  { code: 'GI', name: 'Gibraltar', dialCode: '+350' }, { code: 'GR', name: 'Greece', dialCode: '+30' }, { code: 'GL', name: 'Greenland', dialCode: '+299' }, 
  { code: 'GD', name: 'Grenada', dialCode: '+1-473' }, { code: 'GP', name: 'Guadeloupe', dialCode: '+590' }, { code: 'GU', name: 'Guam', dialCode: '+1-671' }, 
  { code: 'GT', name: 'Guatemala', dialCode: '+502' }, { code: 'GN', name: 'Guinea', dialCode: '+224' }, { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245' }, 
  { code: 'GY', name: 'Guyana', dialCode: '+592' }, { code: 'HT', name: 'Haiti', dialCode: '+509' }, { code: 'HN', name: 'Honduras', dialCode: '+504' }, 
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' }, { code: 'HU', name: 'Hungary', dialCode: '+36' }, { code: 'IS', name: 'Iceland', dialCode: '+354' }, 
  { code: 'IN', name: 'India', dialCode: '+91' }, { code: 'ID', name: 'Indonesia', dialCode: '+62' }, { code: 'IR', name: 'Iran', dialCode: '+98' }, 
  { code: 'IQ', name: 'Iraq', dialCode: '+964' }, { code: 'IE', name: 'Ireland', dialCode: '+353' }, { code: 'IL', name: 'Israel', dialCode: '+972' }, 
  { code: 'IT', name: 'Italy', dialCode: '+39' }, { code: 'JM', name: 'Jamaica', dialCode: '+1-876' }, { code: 'JP', name: 'Japan', dialCode: '+81' }, 
  { code: 'JO', name: 'Jordan', dialCode: '+962' }, { code: 'KZ', name: 'Kazakhstan', dialCode: '+7' }, { code: 'KE', name: 'Kenya', dialCode: '+254' }, 
  { code: 'KI', name: 'Kiribati', dialCode: '+686' }, { code: 'KP', name: 'North Korea', dialCode: '+850' }, { code: 'KR', name: 'South Korea', dialCode: '+82' }, 
  { code: 'KW', name: 'Kuwait', dialCode: '+965' }, { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996' }, { code: 'LA', name: 'Laos', dialCode: '+856' }, 
  { code: 'LV', name: 'Latvia', dialCode: '+371' }, { code: 'LB', name: 'Lebanon', dialCode: '+961' }, { code: 'LS', name: 'Lesotho', dialCode: '+266' }, 
  { code: 'LR', name: 'Liberia', dialCode: '+231' }, { code: 'LY', name: 'Libya', dialCode: '+218' }, { code: 'LI', name: 'Liechtenstein', dialCode: '+423' }, 
  { code: 'LT', name: 'Lithuania', dialCode: '+370' }, { code: 'LU', name: 'Luxembourg', dialCode: '+352' }, { code: 'MO', name: 'Macao', dialCode: '+853' }, 
  { code: 'MK', name: 'North Macedonia', dialCode: '+389' }, { code: 'MG', name: 'Madagascar', dialCode: '+261' }, { code: 'MW', name: 'Malawi', dialCode: '+265' }, 
  { code: 'MY', name: 'Malaysia', dialCode: '+60' }, { code: 'MV', name: 'Maldives', dialCode: '+960' }, { code: 'ML', name: 'Mali', dialCode: '+223' }, 
  { code: 'MT', name: 'Malta', dialCode: '+356' }, { code: 'MH', name: 'Marshall Islands', dialCode: '+692' }, { code: 'MQ', name: 'Martinique', dialCode: '+596' }, 
  { code: 'MR', name: 'Mauritania', dialCode: '+222' }, { code: 'MU', name: 'Mauritius', dialCode: '+230' }, { code: 'YT', name: 'Mayotte', dialCode: '+262' }, 
  { code: 'MX', name: 'Mexico', dialCode: '+52' }, { code: 'FM', name: 'Micronesia', dialCode: '+691' }, { code: 'MD', name: 'Moldova', dialCode: '+373' }, 
  { code: 'MC', name: 'Monaco', dialCode: '+377' }, { code: 'MN', name: 'Mongolia', dialCode: '+976' }, { code: 'MS', name: 'Montserrat', dialCode: '+1-664' }, 
  { code: 'MA', name: 'Morocco', dialCode: '+212' }, { code: 'MZ', name: 'Mozambique', dialCode: '+258' }, { code: 'MM', name: 'Myanmar', dialCode: '+95' }, 
  { code: 'NA', name: 'Namibia', dialCode: '+264' }, { code: 'NR', name: 'Nauru', dialCode: '+674' }, { code: 'NP', name: 'Nepal', dialCode: '+977' }, 
  { code: 'NL', name: 'Netherlands', dialCode: '+31' }, { code: 'NC', name: 'New Caledonia', dialCode: '+687' }, { code: 'NZ', name: 'New Zealand', dialCode: '+64' }, 
  { code: 'NI', name: 'Nicaragua', dialCode: '+505' }, { code: 'NE', name: 'Niger', dialCode: '+227' }, { code: 'NG', name: 'Nigeria', dialCode: '+234' }, 
  { code: 'NU', name: 'Niue', dialCode: '+683' }, { code: 'NF', name: 'Norfolk Island', dialCode: '+672' }, { code: 'MP', name: 'Northern Mariana Islands', dialCode: '+1-670' }, 
  { code: 'NO', name: 'Norway', dialCode: '+47' }, { code: 'OM', name: 'Oman', dialCode: '+968' }, { code: 'PK', name: 'Pakistan', dialCode: '+92' }, 
  { code: 'PW', name: 'Palau', dialCode: '+680' }, { code: 'PA', name: 'Panama', dialCode: '+507' }, { code: 'PG', name: 'Papua New Guinea', dialCode: '+675' }, 
  { code: 'PY', name: 'Paraguay', dialCode: '+595' }, { code: 'PE', name: 'Peru', dialCode: '+51' }, { code: 'PH', name: 'Philippines', dialCode: '+63' }, 
  { code: 'PL', name: 'Poland', dialCode: '+48' }, { code: 'PT', name: 'Portugal', dialCode: '+351' }, { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787' }, 
  { code: 'QA', name: 'Qatar', dialCode: '+974' }, { code: 'RE', name: 'Reunion', dialCode: '+262' }, { code: 'RO', name: 'Romania', dialCode: '+40' }, 
  { code: 'RU', name: 'Russia', dialCode: '+7' }, { code: 'RW', name: 'Rwanda', dialCode: '+250' }, { code: 'KN', name: 'Saint Kitts and Nevis', dialCode: '+1-869' }, 
  { code: 'LC', name: 'Saint Lucia', dialCode: '+1-758' }, { code: 'VC', name: 'Saint Vincent and the Grenadines', dialCode: '+1-784' }, 
  { code: 'WS', name: 'Samoa', dialCode: '+685' }, { code: 'SM', name: 'San Marino', dialCode: '+378' }, { code: 'ST', name: 'Sao Tome and Principe', dialCode: '+239' }, 
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' }, { code: 'SN', name: 'Senegal', dialCode: '+221' }, { code: 'SC', name: 'Seychelles', dialCode: '+248' }, 
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232' }, { code: 'SG', name: 'Singapore', dialCode: '+65' }, { code: 'SK', name: 'Slovakia', dialCode: '+421' }, 
  { code: 'SI', name: 'Slovenia', dialCode: '+386' }, { code: 'SB', name: 'Solomon Islands', dialCode: '+677' }, { code: 'SO', name: 'Somalia', dialCode: '+252' }, 
  { code: 'ZA', name: 'South Africa', dialCode: '+27' }, { code: 'ES', name: 'Spain', dialCode: '+34' }, { code: 'LK', name: 'Sri Lanka', dialCode: '+94' }, 
  { code: 'SD', name: 'Sudan', dialCode: '+249' }, { code: 'SR', name: 'Suriname', dialCode: '+597' }, { code: 'SZ', name: 'Swaziland', dialCode: '+268' }, 
  { code: 'SE', name: 'Sweden', dialCode: '+46' }, { code: 'CH', name: 'Switzerland', dialCode: '+41' }, { code: 'SY', name: 'Syria', dialCode: '+963' }, 
  { code: 'TW', name: 'Taiwan', dialCode: '+886' }, { code: 'TJ', name: 'Tajikistan', dialCode: '+992' }, { code: 'TZ', name: 'Tanzania', dialCode: '+255' }, 
  { code: 'TH', name: 'Thailand', dialCode: '+66' }, { code: 'TG', name: 'Togo', dialCode: '+228' }, { code: 'TK', name: 'Tokelau', dialCode: '+690' }, 
  { code: 'TO', name: 'Tonga', dialCode: '+676' }, { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1-868' }, { code: 'TN', name: 'Tunisia', dialCode: '+216' }, 
  { code: 'TR', name: 'Turkey', dialCode: '+90' }, { code: 'TM', name: 'Turkmenistan', dialCode: '+993' }, { code: 'TC', name: 'Turks and Caicos Islands', dialCode: '+1-649' }, 
  { code: 'TV', name: 'Tuvalu', dialCode: '+688' }, { code: 'UG', name: 'Uganda', dialCode: '+256' }, { code: 'UA', name: 'Ukraine', dialCode: '+380' }, 
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' }, { code: 'UK', name: 'United Kingdom', dialCode: '+44' }, { code: 'US', name: 'United States', dialCode: '+1' }, 
  { code: 'UY', name: 'Uruguay', dialCode: '+598' }, { code: 'UZ', name: 'Uzbekistan', dialCode: '+998' }, { code: 'VU', name: 'Vanuatu', dialCode: '+678' }, 
  { code: 'VE', name: 'Venezuela', dialCode: '+58' }, { code: 'VN', name: 'Vietnam', dialCode: '+84' }, { code: 'VG', name: 'British Virgin Islands', dialCode: '+1-284' }, 
  { code: 'VI', name: 'U.S. Virgin Islands', dialCode: '+1-340' }, { code: 'YE', name: 'Yemen', dialCode: '+967' }, { code: 'ZM', name: 'Zambia', dialCode: '+260' }, 
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' }
];

const KYCModule: React.FC<KYCModuleProps> = ({ user, refreshUser }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user.name || '',
    email: user.email || '',
    phone: '',
    dob: '',
    country: '',
    address: '',
    occupation: '',
    sourceOfFunds: '',
    taxId: '',
    walletAddress: '',
    idType: 'passport',
    idNumber: ''
  });

  // Ensure formData stays in sync if user prop updates later
  useEffect(() => {
    if ((user.name && user.name !== formData.fullName) || (user.email && user.email !== formData.email)) {
        setFormData(prev => ({
            ...prev,
            fullName: user.name || prev.fullName,
            email: user.email || prev.email
        }));
    }
  }, [user.name, user.email]);
  
  // File Upload State
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive Dial Code based on selected country
  const dialCode = useMemo(() => {
    const found = COUNTRIES.find(c => c.name === formData.country);
    return found ? found.dialCode : '';
  }, [formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (type: 'front' | 'back' | 'proof' | 'selfie', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'front') setFrontImage(file);
      else if (type === 'back') setBackImage(file);
      else if (type === 'proof') setProofImage(file);
      else if (type === 'selfie') setSelfieImage(file);
    }
  };

  const clearFile = (e: React.MouseEvent, type: 'front' | 'back' | 'proof' | 'selfie') => {
    e.stopPropagation();
    if (type === 'front') { setFrontImage(null); if (frontInputRef.current) frontInputRef.current.value = ''; }
    else if (type === 'back') { setBackImage(null); if (backInputRef.current) backInputRef.current.value = ''; }
    else if (type === 'proof') { setProofImage(null); if (proofInputRef.current) proofInputRef.current.value = ''; }
    else if (type === 'selfie') { setSelfieImage(null); if (selfieInputRef.current) selfieInputRef.current.value = ''; }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Create temporary URLs for the uploaded files to mock persistence for the Admin Panel
    const frontUrl = frontImage ? URL.createObjectURL(frontImage) : '';
    const backUrl = backImage ? URL.createObjectURL(backImage) : '';
    const proofUrl = proofImage ? URL.createObjectURL(proofImage) : '';
    const selfieUrl = selfieImage ? URL.createObjectURL(selfieImage) : '';

    // Combine dial code with phone number for final submission
    const finalPhone = dialCode ? `${dialCode} ${formData.phone}` : formData.phone;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      submitKYC(user.id, { 
          ...formData, 
          phone: finalPhone,
          frontUrl,
          backUrl,
          proofUrl,
          selfieUrl
      });
      refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper to render file upload box ---
  const renderFileUpload = (
      label: string, 
      subLabel: string, 
      file: File | null, 
      ref: React.RefObject<HTMLInputElement | null>, 
      type: 'front' | 'back' | 'proof' | 'selfie'
    ) => (
    <div 
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition group cursor-pointer relative overflow-hidden h-48 ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-cyber-border hover:border-cyber-accent bg-cyber-dark/50'}`}
    >
      <input 
          type="file" 
          ref={ref} 
          hidden 
          accept="image/*,application/pdf"
          onChange={(e) => handleFileSelect(type, e)}
      />
      
      {file ? (
        <>
            <button 
                onClick={(e) => clearFile(e, type)} 
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition z-10"
            >
                <X size={14} />
            </button>
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                <CheckCircle size={20} />
            </div>
            <p className="text-sm font-medium text-emerald-400 truncate max-w-full px-2">{file.name}</p>
            <p className="text-xs text-emerald-500/70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </>
      ) : (
        <>
            <div className="w-10 h-10 bg-cyber-border/50 rounded-full flex items-center justify-center mb-3 group-hover:bg-cyber-accent/20 group-hover:text-cyber-accent transition">
                <Upload size={20} />
            </div>
            <p className="text-sm font-medium text-gray-300">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{subLabel}</p>
        </>
      )}
    </div>
  );

  const isStep1Valid = () => {
    // Check all required fields are non-empty strings using explicit boolean conversion
    const requiredFields = [
        formData.fullName,
        formData.email,
        formData.phone,
        formData.dob,
        formData.country,
        formData.address,
        formData.occupation,
        formData.sourceOfFunds,
        formData.walletAddress
    ];
    
    // Ensure every field exists and has length > 0 after trimming
    const isBasicInfoValid = requiredFields.every(field => field && String(field).trim().length > 0);

    if (!isBasicInfoValid) return false;

    // If US, Tax ID is explicitly required
    if (formData.country === 'US' || formData.country === 'United States') {
        return !!(formData.taxId && String(formData.taxId).trim().length > 0);
    }
    
    return true;
  };

  if (user.kycStatus === KYCStatus.VERIFIED) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-cyber-card border border-emerald-500/30 rounded-xl text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-2">
          <Shield size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">Identity Verified</h2>
        <p className="text-gray-400 max-w-md">
          Your account has passed all AML/KYC checks. You have full access to withdrawals and higher trading limits.
        </p>
      </div>
    );
  }

  if (user.kycStatus === KYCStatus.PENDING) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-cyber-card border border-yellow-500/30 rounded-xl text-center space-y-4">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-2">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">Application Under Review</h2>
        <p className="text-gray-400 max-w-md">
          Our compliance team is currently reviewing your documents. This process typically takes 24-48 hours. You will be notified once the review is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-cyber-accent" />
          Identity Verification (AML/KYC)
        </h2>
        <div className="flex items-center space-x-2 text-sm">
           <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-cyber-accent text-cyber-dark font-bold' : 'bg-cyber-card border border-cyber-border text-gray-500'}`}>1</span>
           <div className="w-8 h-px bg-cyber-border"></div>
           <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-cyber-accent text-cyber-dark font-bold' : 'bg-cyber-card border border-cyber-border text-gray-500'}`}>2</span>
           <div className="w-8 h-px bg-cyber-border"></div>
           <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-cyber-accent text-cyber-dark font-bold' : 'bg-cyber-card border border-cyber-border text-gray-500'}`}>3</span>
        </div>
      </div>

      {user.kycStatus === KYCStatus.REJECTED && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-500 animate-pulse">
           <AlertCircle />
           <div>
             <p className="font-bold">Verification Rejected</p>
             <p className="text-sm opacity-80">Please check your details and upload clearer documents as per the comments in your email.</p>
           </div>
        </div>
      )}

      <div className="bg-cyber-card border border-cyber-border rounded-xl p-8">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserIcon size={20} /> Personal & Financial Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Legal Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                    placeholder="As shown on ID"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Country of Residence</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                <div className="flex relative">
                  <div className="bg-cyber-dark border border-r-0 border-cyber-border rounded-l-lg p-3 text-gray-400 font-mono w-20 flex items-center justify-center text-sm">
                    {dialCode || '--'}
                  </div>
                  <input 
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!formData.country}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-r-lg p-3 text-white focus:border-cyber-accent outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={formData.country ? "123 456 7890" : "Select Country First"}
                  />
                  <Phone size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                <input 
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Residential Address</label>
                <input 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                  placeholder="Street, City, Zip Code"
                />
              </div>

               {/* Occupation */}
               <div>
                <label className="block text-sm text-gray-400 mb-2">Occupation</label>
                <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-3.5 text-gray-500" />
                    <input 
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                        placeholder="e.g. Engineer, Student"
                    />
                </div>
              </div>

              {/* Source of Funds */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Source of Funds</label>
                <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                    <select 
                        name="sourceOfFunds"
                        value={formData.sourceOfFunds}
                        onChange={handleInputChange}
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none appearance-none"
                    >
                        <option value="">Select Source</option>
                        <option value="Salary">Salary / Employment</option>
                        <option value="Investments">Investments / Dividends</option>
                        <option value="Savings">Savings</option>
                        <option value="Inheritance">Inheritance</option>
                        <option value="Crypto Mining">Crypto Mining</option>
                    </select>
                </div>
              </div>

              {/* Tax ID - Conditionally Rendered for US Only */}
              {(formData.country === 'US' || formData.country === 'United States') && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm text-gray-400 mb-2">Tax ID / SSN <span className="text-red-500 ml-1">*Required for US Residents</span></label>
                    <div className="relative">
                        <Hash size={16} className="absolute left-3 top-3.5 text-gray-500" />
                        <input 
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleInputChange}
                            className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                            placeholder="SSN or TIN"
                        />
                    </div>
                  </div>
              )}

              {/* Wallet Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Crypto Wallet Address <span className="text-xs text-cyber-accent">(For Whitelisting)</span></label>
                <div className="relative">
                    <Wallet size={16} className="absolute left-3 top-3.5 text-gray-500" />
                    <input 
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleInputChange}
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none placeholder-gray-600 font-mono text-sm"
                        placeholder="0x..."
                    />
                </div>
              </div>

            </div>
            <div className="flex justify-end pt-4 border-t border-cyber-border mt-6">
              <button 
                onClick={() => setStep(2)}
                disabled={!isStep1Valid()}
                className="flex items-center gap-2 bg-cyber-accent text-cyber-dark font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENT UPLOADS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText size={20} /> Document Verification</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm text-gray-400 mb-2">Document Type</label>
                    <select 
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none"
                    >
                        <option value="passport">Passport</option>
                        <option value="id_card">National ID Card</option>
                        <option value="drivers_license">Driver's License</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-2">Document Number</label>
                    <input 
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none placeholder-gray-600"
                        placeholder="Document ID #"
                    />
                 </div>
               </div>

               {/* ID Front */}
               {renderFileUpload("Upload ID Front", "Government Issued ID", frontImage, frontInputRef, 'front')}

               {/* ID Back */}
               {renderFileUpload("Upload ID Back", "Reverse side if applicable", backImage, backInputRef, 'back')}

               {/* Proof of Address */}
               {renderFileUpload("Proof of Address", "Utility Bill or Bank Statement (Max 3mo old)", proofImage, proofInputRef, 'proof')}

               {/* Selfie */}
               {renderFileUpload("Selfie Verification", "Hold your ID and look at camera", selfieImage, selfieInputRef, 'selfie')}

             </div>

             <div className="flex justify-between pt-4 border-t border-cyber-border mt-6">
               <button 
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white transition"
                >
                  Back
                </button>
               <button 
                onClick={() => setStep(3)}
                disabled={!frontImage || !backImage || !proofImage || !selfieImage || !formData.idNumber}
                className="flex items-center gap-2 bg-cyber-accent text-cyber-dark font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Application <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={20} /> Final Review</h3>
            
            <div className="bg-cyber-dark rounded-lg p-6 space-y-4 border border-cyber-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase border-b border-cyber-border pb-1">Personal Info</h4>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Legal Name</span><span className="text-white text-sm">{formData.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Email</span><span className="text-white text-sm">{formData.email}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Phone</span><span className="text-white text-sm">{dialCode} {formData.phone}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Date of Birth</span><span className="text-white text-sm">{formData.dob}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Country</span><span className="text-white text-sm">{formData.country}</span></div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase border-b border-cyber-border pb-1">Financial & ID</h4>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Occupation</span><span className="text-white text-sm">{formData.occupation}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Source of Funds</span><span className="text-white text-sm">{formData.sourceOfFunds}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Wallet Address</span><span className="text-white text-sm font-mono truncate max-w-[150px]">{formData.walletAddress}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">ID Type</span><span className="text-white text-sm capitalize">{formData.idType.replace('_', ' ')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 text-sm">ID Number</span><span className="text-white text-sm">{formData.idNumber}</span></div>
                        {(formData.country === 'US' || formData.country === 'United States') && (
                            <div className="flex justify-between"><span className="text-gray-400 text-sm">Tax ID</span><span className="text-white text-sm font-mono">{formData.taxId}</span></div>
                        )}
                    </div>
                </div>

               <div className="pt-4 mt-2">
                 <h4 className="text-sm font-bold text-gray-500 uppercase border-b border-cyber-border pb-2 mb-3">Document Status</h4>
                 <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Front ID Uploaded</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Back ID Uploaded</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Proof of Address</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Selfie</span>
                 </div>
               </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-cyber-accent/10 rounded-lg">
               <input type="checkbox" className="mt-1" />
               <p className="text-sm text-gray-300">I certify that the information provided is true and accurate. I understand that providing false information may result in account termination and legal action.</p>
            </div>

             <div className="flex justify-between pt-4">
               <button 
                  onClick={() => setStep(2)}
                  className="text-gray-400 hover:text-white transition"
                >
                  Back
                </button>
               <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-cyber-accent text-cyber-dark font-bold px-8 py-3 rounded-lg hover:bg-emerald-400 transition shadow-lg shadow-emerald-900/20"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCModule;