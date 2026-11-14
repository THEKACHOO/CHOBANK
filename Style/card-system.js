const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbwvk07oRYureEVNYulf-2GsEXu52MqrTUPuC546Rycx8Pum21ai5YboZnplayfA9PqnTw/exec";
const usedCardNumbers = new Set();
let selectedCardType = '', currentAccountNumber = '', currentCardType = '', currentCardName = '', pendingPreviewScroll = false;

document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.card-option').forEach(opt=>{
        opt.addEventListener('click',function(){
            document.querySelectorAll('.card-option').forEach(o=>o.classList.remove('selected'));
            this.classList.add('selected');
            selectedCardType=this.getAttribute('data-type');
            if(selectedCardType==='business') openBusinessModal();
            else if(selectedCardType==='student') openStudentModal();
        });
    });
    document.getElementById('generate-card-btn').addEventListener('click',generateCard);
    document.getElementById('download-card-btn').addEventListener('click',downloadCard);
    document.getElementById('new-card-btn').addEventListener('click',function(){
        document.getElementById('preview-section').classList.add('hidden');
        document.getElementById('card-form').reset();
        document.querySelectorAll('.card-option').forEach(o=>o.classList.remove('selected'));
        selectedCardType=''; currentAccountNumber=''; currentCardType=''; currentCardName='';
    });
    document.getElementById('close-business-modal').addEventListener('click',closeBusinessModal);
    document.getElementById('cancel-business-btn').addEventListener('click',closeBusinessModal);
    document.getElementById('business-form').addEventListener('submit',submitBusinessForm);
    document.getElementById('close-student-modal').addEventListener('click',closeStudentModal);
    document.getElementById('cancel-student-btn').addEventListener('click',closeStudentModal);
    document.getElementById('student-form').addEventListener('submit',submitStudentForm);
});

function openBusinessModal(){document.getElementById('business-modal').classList.add('active');document.body.style.overflow='hidden';}
function closeBusinessModal(){document.getElementById('business-modal').classList.remove('active');document.body.style.overflow='auto';document.getElementById('business-form').reset();document.querySelectorAll('.card-option').forEach(o=>o.classList.remove('selected'));selectedCardType='';scrollToPendingPreview();}
function openStudentModal(){document.getElementById('student-modal').classList.add('active');document.body.style.overflow='hidden';}
function closeStudentModal(){document.getElementById('student-modal').classList.remove('active');document.body.style.overflow='auto';document.getElementById('student-form').reset();document.querySelectorAll('.card-option').forEach(o=>o.classList.remove('selected'));selectedCardType='';scrollToPendingPreview();}

async function generateCard(){
    const fullName=document.getElementById('full-name').value.trim(),address=document.getElementById('address').value.trim();
    if(!fullName||!address){alert('Please fill in full name and address!');return;}
    if(!selectedCardType||selectedCardType==='business'||selectedCardType==='student'){alert('Please select a valid card type (Regular, Silver, or Gold)!');return;}
    let cardNumber; do{ cardNumber=generateUniqueCardNumber(); }while(usedCardNumbers.has(cardNumber));
    usedCardNumbers.add(cardNumber); currentAccountNumber=cardNumber.replace(/\s/g,'');
    currentCardType=selectedCardType; currentCardName=fullName;
    const expiryDate=generateExpiryDate();
    updateCardPreview(fullName,cardNumber,expiryDate,selectedCardType);
    document.getElementById('loading').style.display='block';
    try{
        const result=await sendToSpreadsheet({name:fullName,address:address,cardType:selectedCardType,cardNumber:currentAccountNumber,accountNumber:currentAccountNumber,expiryDate:expiryDate});
        if(result.success){
            document.getElementById('preview-section').classList.remove('hidden');
            document.getElementById('preview-section').classList.add('fade-in');
            setTimeout(()=>document.getElementById('preview-section').scrollIntoView({behavior:'smooth',block:'start'}),300);
            alert('Card successfully created and data saved!');
        } else throw new Error('Failed to save data');
    } catch(error){ alert('Failed to save data: '+error.message); }
    finally{ document.getElementById('loading').style.display='none'; }
}

function scrollToPendingPreview(){
    if(!pendingPreviewScroll) return;
    pendingPreviewScroll=false;
    setTimeout(()=>document.getElementById('preview-section').scrollIntoView({behavior:'smooth',block:'start'}),300);
}
function revealPreview(){
    const p=document.getElementById('preview-section');
    p.classList.remove('hidden'); p.classList.add('fade-in');
    pendingPreviewScroll=true;
}

async function submitBusinessForm(e){
    e.preventDefault();
    const data={companyName:document.getElementById('company-name').value.trim(),companyType:document.getElementById('company-type').value.trim(),companyYear:document.getElementById('company-year').value.trim(),founder:document.getElementById('company-founder').value.trim(),accountManager:document.getElementById('account-manager').value.trim()};
    if(!data.companyName||!data.companyType||!data.companyYear||!data.founder||!data.accountManager){alert('Please complete all company data!');return;}
    let cardNumber; do{ cardNumber=generateUniqueCardNumber(); }while(usedCardNumbers.has(cardNumber));
    usedCardNumbers.add(cardNumber);
    const expiryDate=generateExpiryDate();
    data.cardNumber=cardNumber.replace(/\s/g,''); data.expiryDate=expiryDate;
    try{
        await sendToSpreadsheet(data);
        currentCardType='business'; currentCardName=data.companyName;
        updateCardPreview(data.companyName,cardNumber,expiryDate,'business');
        revealPreview();
        closeBusinessModal();
    } catch(error){ alert('Failed to send data: '+error.message); }
}

async function submitStudentForm(e){
    e.preventDefault();
    const studentName=document.getElementById('student-name').value.trim(),studentDOB=document.getElementById('student-dob').value.trim(),studentSchool=document.getElementById('student-school').value.trim(),parentOccupation=document.getElementById('parent-occupation').value.trim(),studentAddress=document.getElementById('student-address').value.trim();
    if(!studentName||!studentDOB||!studentSchool||!parentOccupation||!studentAddress){alert('Please complete all student data!');return;}
    let cardNumber; do{ cardNumber=generateUniqueCardNumber(); }while(usedCardNumbers.has(cardNumber));
    usedCardNumbers.add(cardNumber);
    const expiryDate=generateExpiryDate();
    try{
        await sendToSpreadsheet({studentName:studentName,dateOfBirth:studentDOB,school:studentSchool,parentOccupation:parentOccupation,address:studentAddress,cardNumber:cardNumber.replace(/\s/g,''),expiryDate:expiryDate});
        currentCardType='student'; currentCardName=studentName;
        updateCardPreview(studentName,cardNumber,expiryDate,'student');
        revealPreview();
        closeStudentModal();
    } catch(error){ alert('Failed to send data: '+error.message); }
}

async function sendToSpreadsheet(data){ const response=await fetch(SPREADSHEET_URL,{method:'POST',body:JSON.stringify(data)}); if(!response.ok) throw new Error(`HTTP ${response.status}`); const result=await response.json(); if(!result.success) throw new Error(result.error||'Failed'); return result; }
function generateUniqueCardNumber(){ let n=''; for(let i=0;i<4;i++){ n+=Math.floor(1000+Math.random()*9000); if(i<3) n+=' '; } return n; }
function generateExpiryDate(){ const now=new Date(); const month=String(now.getMonth()+1).padStart(2,'0'); const year=String(now.getFullYear()+5).slice(-2); return `${month}/${year}`; }

function updateCardPreview(name,cardNumber,expiryDate,type){
    const cardPreview=document.getElementById('card-preview');
    const cardTypeLabel=document.getElementById('card-type-label');
    const cardNumberDisplay=document.getElementById('card-number-display');
    const cardHolderName=document.getElementById('card-holder-name');
    const cardExpiryDate=document.getElementById('card-expiry-date');
    const cardLogoText=document.getElementById('card-logo-text');
    
    document.getElementById('display-card-number').textContent=cardNumber;
    document.getElementById('display-holder-name').textContent=name;
    document.getElementById('display-expiry-date').textContent=expiryDate;
    document.getElementById('display-card-type').textContent=type.toUpperCase();
    const holderLabels={business:['COMPANY NAME','Company Name:'],student:['STUDENT NAME','Student Name:']};
    const hl=holderLabels[type]||['CARDHOLDER NAME','Cardholder Name:'];
    document.getElementById('card-holder-label').firstChild.nodeValue=hl[0]+'\n                                    ';
    document.getElementById('display-holder-label').textContent=hl[1];
    
    cardPreview.className='card-preview '+type;
    cardLogoText.className='card-logo-text '+type;
    cardLogoText.textContent='CHOBANK';
    
    cardTypeLabel.textContent=type.toUpperCase();
    cardTypeLabel.className='card-type';
    if(type==='silver') cardTypeLabel.classList.add('silver');
    else if(type==='gold') cardTypeLabel.classList.add('gold');
    else if(type==='business') cardTypeLabel.classList.add('business');
    else if(type==='student') cardTypeLabel.classList.add('student');
    
    cardNumberDisplay.textContent=cardNumber;
    cardNumberDisplay.className='card-number';
    
    cardHolderName.textContent=name.toUpperCase();
    cardExpiryDate.textContent=expiryDate;
}

function downloadCard(){
    const cardPreview=document.getElementById('card-preview');
    if(!cardPreview){ alert('Please generate a card first!'); return; }
    const loadingDiv=document.getElementById('loading');
    loadingDiv.style.display='block';
    const tempContainer=document.createElement('div');
    tempContainer.style.position='fixed'; tempContainer.style.left='-9999px'; tempContainer.style.top='-9999px';
    tempContainer.style.width='420px'; tempContainer.style.height='270px';
    const clonedCard=cardPreview.cloneNode(true);
    clonedCard.style.transform='none'; clonedCard.style.width='420px'; clonedCard.style.height='270px';
    clonedCard.style.borderRadius='20px'; clonedCard.style.padding='22px';
    clonedCard.style.boxShadow='none';
    tempContainer.appendChild(clonedCard);
    document.body.appendChild(tempContainer);
    const watermark=document.createElement('div');
    watermark.style.position='absolute'; watermark.style.bottom='10px'; watermark.style.right='12px';
    watermark.style.fontSize='10px'; watermark.style.fontWeight='600'; watermark.style.fontFamily="'Outfit', monospace";
    watermark.textContent='ROLEPLAY ONLY';
    if(currentCardType==='student') watermark.style.color='rgba(0,0,0,0.5)';
    else watermark.style.color='rgba(255,255,255,0.5)';
    clonedCard.appendChild(watermark);
    setTimeout(()=>{
        html2canvas(clonedCard,{
            scale: 2.5,
            backgroundColor: null,
            useCORS: true,
            width: 420,
            height: 270,
            logging: false,
            background: 'transparent'
        }).then(canvas=>{
            const link=document.createElement('a');
            const name=currentCardName.replace(/\s+/g,'_');
            link.download=`chobank_${currentCardType}_card_${name}_${Date.now()}.png`;
            link.href=canvas.toDataURL('image/png');
            link.click();
            document.body.removeChild(tempContainer);
            loadingDiv.style.display='none';
            alert('ATM card downloaded successfully! (PNG with transparent background)');
        }).catch(err=>{ console.error(err); document.body.removeChild(tempContainer); loadingDiv.style.display='none'; alert('Error creating card image.'); });
    }, 300);
                                                      }
