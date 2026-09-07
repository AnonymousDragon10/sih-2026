import type { ClinicalSummary, RedFlag, Language } from '../types'

interface PdfOptions {
  patientName?: string
  patientAge?: string
  patientGender?: string
  abhaId?: string
  language?: string
  mode?: string
}

const sectionLabels: Record<Language, { key: keyof ClinicalSummary; label: string }[]> = {
  en: [
    { key: 'chief_complaint', label: 'Chief Complaint' },
    { key: 'hpi', label: 'History of Present Illness' },
    { key: 'past_medical_history', label: 'Past Medical / Surgical History' },
    { key: 'drug_allergy_history', label: 'Drug & Allergy History' },
    { key: 'family_history', label: 'Family History' },
    { key: 'personal_history', label: 'Personal History' },
    { key: 'review_of_systems', label: 'Review of Systems' },
    { key: 'prior_investigations', label: 'Prior Investigations' },
  ],
  hi: [
    { key: 'chief_complaint', label: 'मुख्य शिकायत' },
    { key: 'hpi', label: 'वर्तमान बीमारी का इतिहास' },
    { key: 'past_medical_history', label: 'अतीत चिकित्सा / शल्य चिकित्सा इतिहास' },
    { key: 'drug_allergy_history', label: 'दवा और एलर्जी इतिहास' },
    { key: 'family_history', label: 'पारिवारिक इतिहास' },
    { key: 'personal_history', label: 'व्यक्तिगत इतिहास' },
    { key: 'review_of_systems', label: 'तंत्र समीक्षा' },
    { key: 'prior_investigations', label: 'पूर्व जांचें' },
  ],
  bn: [
    { key: 'chief_complaint', label: 'প্রধান অভিযোগ' },
    { key: 'hpi', label: 'বর্তমান অসুস্থতার ইতিহাস' },
    { key: 'past_medical_history', label: 'অতীত চিকিৎসা / শল্য চিকিৎসা ইতিহাস' },
    { key: 'drug_allergy_history', label: 'ওষুধ ও অ্যালার্জি ইতিহাস' },
    { key: 'family_history', label: 'পারিবারিক ইতিহাস' },
    { key: 'personal_history', label: 'ব্যক্তিগত ইতিহাস' },
    { key: 'review_of_systems', label: 'তন্ত্র পর্যালোচনা' },
    { key: 'prior_investigations', label: 'পূর্ববর্তী তদন্ত' },
  ],
  ta: [
    { key: 'chief_complaint', label: 'முக்கிய புகார்' },
    { key: 'hpi', label: 'தற்போதைய நோய் வரலாறு' },
    { key: 'past_medical_history', label: 'கடந்த மருத்துவ / அறுவை வரலாறு' },
    { key: 'drug_allergy_history', label: 'மருந்து மற்றும் ஒவ்வாமை வரலாறு' },
    { key: 'family_history', label: 'குடும்ப வரலாறு' },
    { key: 'personal_history', label: 'தனிப்பட்ட வரலாறு' },
    { key: 'review_of_systems', label: 'அமைப்பு மதிப்பாய்வு' },
    { key: 'prior_investigations', label: 'முந்தைய விசாரணைகள்' },
  ],
  te: [
    { key: 'chief_complaint', label: 'ప్రధాన ఫిర్యాదు' },
    { key: 'hpi', label: 'ప్రస్తుత అనారోగ్య చరిత్ర' },
    { key: 'past_medical_history', label: 'గత వైద్య / శస్త్రచికిత్స చరిత్ర' },
    { key: 'drug_allergy_history', label: 'మందు మరియు అలర్జీ చరిత్ర' },
    { key: 'family_history', label: 'కుటుంబ చరిత్ర' },
    { key: 'personal_history', label: 'వ్యక్తిగత చరిత్ర' },
    { key: 'review_of_systems', label: 'వ్యవస్థ సమీక్ష' },
    { key: 'prior_investigations', label: 'ముందలి పరిశోధనలు' },
  ],
  kn: [
    { key: 'chief_complaint', label: 'ಮುಖ್ಯ ದೂರು' },
    { key: 'hpi', label: 'ಪ್ರಸ್ತುತ ಅನಾರೋಗ್ಯದ ಇತಿಹಾಸ' },
    { key: 'past_medical_history', label: 'ಹಿಂದಿನ ವೈದ್ಯಕೀಯ / ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಇತಿಹಾಸ' },
    { key: 'drug_allergy_history', label: 'ಔಷಧ ಮತ್ತು ಅಲರ್ಜಿ ಇತಿಹಾಸ' },
    { key: 'family_history', label: 'ಕುಟುಂಬ ಇತಿಹಾಸ' },
    { key: 'personal_history', label: 'ವೈಯಕ್ತಿಕ ಇತಿಹಾಸ' },
    { key: 'review_of_systems', label: 'ವ್ಯವಸ್ಥೆ ಪರಿಶೀಲನೆ' },
    { key: 'prior_investigations', label: 'ಹಿಂದಿನ ತಪಾಸಣೆಗಳು' },
  ],
  mr: [
    { key: 'chief_complaint', label: 'मुख्य तक्रार' },
    { key: 'hpi', label: 'सध्याच्या आजाराचा इतिहास' },
    { key: 'past_medical_history', label: 'भूतकाळातील वैद्यकीय / शस्त्रक्रिया इतिहास' },
    { key: 'drug_allergy_history', label: 'औषध आणि ऍलर्जी इतिहास' },
    { key: 'family_history', label: 'कौटुंबिक इतिहास' },
    { key: 'personal_history', label: 'वैयक्तिक इतिहास' },
    { key: 'review_of_systems', label: 'प्रणाली समीक्षा' },
    { key: 'prior_investigations', label: 'मागील तपासण्या' },
  ],
  gu: [
    { key: 'chief_complaint', label: 'મુખ્ય ફરિયાદ' },
    { key: 'hpi', label: 'વર્તમાન બીમારીનો ઇતિહાસ' },
    { key: 'past_medical_history', label: 'ભૂતપૂર્વ વૈદ્યકીય / સર્જિકલ ઇતિહાસ' },
    { key: 'drug_allergy_history', label: 'દવા અને એલર્જી ઇતિહાસ' },
    { key: 'family_history', label: 'કુટુંબ ઇતિહાસ' },
    { key: 'personal_history', label: 'વ્યક્તિગત ઇતિહાસ' },
    { key: 'review_of_systems', label: 'સિસ્ટમ સમીક્ષા' },
    { key: 'prior_investigations', label: 'પાછલી તપાસ' },
  ],
  pa: [
    { key: 'chief_complaint', label: 'ਮੁੱਖ ਸ਼ਿਕਾਇਤ' },
    { key: 'hpi', label: 'ਮੌਜੂਦਾ ਬੀਮਾਰੀ ਦਾ ਇਤਿਹਾਸ' },
    { key: 'past_medical_history', label: 'ਪਿਛਲਾ ਮੈਡੀਕਲ / ਸਰਜੀਕਲ ਇਤਿਹਾਸ' },
    { key: 'drug_allergy_history', label: 'ਦਵਾਈ ਅਤੇ ਐਲਰਜੀ ਇਤਿਹਾਸ' },
    { key: 'family_history', label: 'ਪਰਿਵਾਰਕ ਇਤਿਹਾਸ' },
    { key: 'personal_history', label: 'ਨਿੱਜੀ ਇਤਿਹਾਸ' },
    { key: 'review_of_systems', label: 'ਸਿਸਟਮ ਸਮੀਖਿਆ' },
    { key: 'prior_investigations', label: 'ਪਿਛਲੀਆਂ ਜਾਂਚਾਂ' },
  ],
  ml: [
    { key: 'chief_complaint', label: 'പ്രധാന പരാതി' },
    { key: 'hpi', label: 'നിലവിലെ അസുഖത്തിന്റെ ചരിത്രം' },
    { key: 'past_medical_history', label: 'മുൻ വൈദ്യ / ശസ്ത്രക്രിയ ചരിത്രം' },
    { key: 'drug_allergy_history', label: 'മരുന്ന് അലർജി ചരിത്രം' },
    { key: 'family_history', label: 'കുടുംബ ചരിത്രം' },
    { key: 'personal_history', label: 'വ്യക്തിഗത ചരിത്രം' },
    { key: 'review_of_systems', label: 'സിസ്റ്റം അവലോകനം' },
    { key: 'prior_investigations', label: 'മുൻ അന്വേഷണങ്ങൾ' },
  ],
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'patient'
}

export async function generatePrescriptionPdf(
  summary: ClinicalSummary,
  redFlags: RedFlag[] = [],
  options: PdfOptions = {}
): Promise<void> {
  const lang = (options.language as Language) || 'en'
  const sections = sectionLabels[lang] || sectionLabels.en

  const redFlagHtml = redFlags.length > 0
    ? `<div class="red-flags">
        <h2>⚠ Red Flag Detection</h2>
        <ul>${redFlags.map((f) => `<li>${escapeHtml(f.description)} [${escapeHtml(f.severity.toUpperCase())}]</li>`).join('')}</ul>
      </div>`
    : ''

  const ayushHtml = summary.ayush_assessment
    ? `<div class="ayush">
        <h2>AYUSH Assessment - Dashavidha Pariksha</h2>
        <table>
          ${Object.entries(summary.ayush_assessment).map(([key, value]) => `<tr><td class="ayush-key">${escapeHtml(key.replace(/_/g, ' '))}</td><td>${escapeHtml(String(value))}</td></tr>`).join('')}
        </table>
      </div>`
    : ''

  const sectionsHtml = sections.map((section) => {
    const value = String((summary as unknown as Record<string, unknown>)[section.key] || 'Not specified')
    return `<div class="section">
      <h3>${escapeHtml(section.label)}</h3>
      <p>${escapeHtml(value).replace(/\n/g, '<br>')}</p>
    </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>MediKiosk Prescription - ${escapeHtml(options.patientName || 'Patient')}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans', 'Noto Sans Bengali', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Gujarati', 'Noto Sans Gurmukhi', system-ui, sans-serif; color: #1f2937; line-height: 1.5; }
  .header { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; border-bottom: 2px solid #e0e7ff; margin-bottom: 20px; }
  .logo-box { width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #3380fc, #1c61f0); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-box img { width: 52px; height: 52px; border-radius: 8px; object-fit: contain; }
  .logo-text h1 { font-size: 22px; color: #1a388f; }
  .logo-text p { font-size: 10px; color: #599fff; }
  .meta { margin-left: auto; text-align: right; font-size: 9px; color: #4b5563; }
  .patient-box { background: #f0f7ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; font-size: 10px; }
  .patient-box .label { font-weight: bold; color: #1f2937; }
  .patient-box .value { color: #374151; }
  .red-flags { background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
  .red-flags h2 { font-size: 13px; color: #b91c1c; margin-bottom: 8px; }
  .red-flags ul { list-style: none; padding-left: 0; }
  .red-flags li { font-size: 10px; color: #991b1b; margin-bottom: 4px; }
  .section { margin-bottom: 14px; }
  .section h3 { font-size: 11px; color: #1e3a5f; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px; margin-bottom: 6px; }
  .section p { font-size: 10px; color: #374151; white-space: pre-wrap; }
  .ayush { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
  .ayush h2 { font-size: 12px; color: #92400e; margin-bottom: 8px; }
  .ayush table { width: 100%; border-collapse: collapse; }
  .ayush td { font-size: 9px; padding: 3px 6px; border-bottom: 1px solid #fde68a; }
  .ayush .ayush-key { font-weight: bold; color: #92400e; text-transform: capitalize; width: 40%; }
  .footer { text-align: center; font-size: 8px; color: #9ca3af; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-box"><img src="/WhatsApp_Image_2026-09-05 copy.jpeg" alt="MediKiosk" /></div>
    <div class="logo-text">
      <h1>MediKiosk</h1>
      <p>AI Clinical History Platform</p>
    </div>
    <div class="meta">
      Generated: ${escapeHtml(new Date().toLocaleString())}<br>
      Mode: ${escapeHtml(options.mode || 'allopathic')}
    </div>
  </div>
  <div class="patient-box">
    <div><span class="label">Patient:</span> <span class="value">${escapeHtml(options.patientName || 'N/A')}</span></div>
    <div><span class="label">Age:</span> <span class="value">${escapeHtml(options.patientAge || 'N/A')}</span></div>
    <div><span class="label">Gender:</span> <span class="value">${escapeHtml(options.patientGender || 'N/A')}</span></div>
    <div><span class="label">ABHA:</span> <span class="value">${escapeHtml(options.abhaId || 'N/A')}</span></div>
  </div>
  ${redFlagHtml}
  <h2 style="font-size:15px;color:#1a388f;margin-bottom:12px;">Clinical History Summary</h2>
  ${sectionsHtml}
  ${ayushHtml}
  <div class="footer">MediKiosk | This summary is a draft for physician review. The physician retains full control.</div>
</body>
</html>`

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow pop-ups to download the prescription PDF.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}
