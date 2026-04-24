import { createAdminClient } from '@/utils/supabase/server'
import DotNoise from '@/components/DotNoise'
import Guilloche from '@/components/Guilloche'
import Watermark from '@/components/Watermark'
import MicrotextLine from '@/components/MicrotextLine'

import localFont from 'next/font/local';

const alabdFont = localFont({
  src: './../../../fonts/alabd.ttf',
});
const urduFont = localFont({
  src: './../../../fonts/text.ttf',
});

export default async function PrintTemplatePage(props: { searchParams: Promise<{ bcode?: string }> }) {
  const searchParams = await props.searchParams
  const bcode = searchParams.bcode

  if (!bcode) return <div>Invalid Batch</div>

  const supabase = await createAdminClient()

  // Fetch batch details and associated Serial Numbers
  const { data: batch } = await supabase
    .from('batches')
    .select('*, wakalat_namas(serial_number)')
    .eq('batch_code', bcode)
    .single()

  if (!batch || !batch.wakalat_namas) return <div>Batch Not Found</div>

  const serials = batch.wakalat_namas.map((w: any) => w.serial_number).sort()

  return (
    <div className={`w-full bg-white text-black min-h-screen`}>
      <style dangerouslySetInnerHTML={{
        __html: `
     
        @media print {
          @page { 
            size: legal; 
            margin: 0; 
          }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 8.5in !important;
            height: 14in !important;
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
          }
          /* Lock layout to Legal (8.5x14) so printers don't reflow/scale */
          .print-container {
            width: 8.5in !important;
            height: 14in !important;
            max-height: 14in !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
        }
      `}} />
      {serials.map((serial: string, index: number) => {
        const isLast = index === serials.length - 1;
        const microtext = `\u00A0${serial} - VALID ORIGINAL - `;

        return (
          <div
            key={serial}
            className="print-container relative w-[8.5in] h-[14in] max-h-[14in] overflow-hidden bg-white box-border px-[29mm] py-[12mm] mx-auto"
            style={{
              pageBreakAfter: isLast ? 'auto' : 'always',
              breakAfter: isLast ? 'auto' : 'page',
              breakInside: 'avoid'
            }}
          >
            {/* React Security Components */}
            <DotNoise />
            <Watermark text="DBA BWN" />

            {/* The Outer Box Formed Purely by Microtext! */}
            <div className="absolute inset-0 z-0 pointer-events-none border-[14px] border-transparent" style={{ padding: '7mm' }}>
              <div className="absolute top-0 left-0 right-0 overflow-hidden h-6"><MicrotextLine text={microtext} /></div>
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-6"><MicrotextLine text={microtext} /></div>

            </div>

            {/* Top / Bottom Guilloche */}
            <div className="absolute top-[12mm] left-[15mm] right-[15mm]"><Guilloche height={40} className="w-full opacity-60" /></div>
            <div className="absolute bottom-[12mm] left-[15mm] right-[15mm]"><Guilloche height={40} className="w-full opacity-60" /></div>

            {/* Inner Content - Forced to fit exactly 1 page */}
            <div className={`relative z-10 w-full h-full flex flex-col justify-between text-[16pt] ${urduFont.className}`} dir="rtl" >

              {/* Header */}
              <div className="flex justify-between items-center     ">
                <div className="w-28 h-28 rounded-full border-2 border-black flex items-center justify-center bg-transparent shadow-sm ml-16">
                  <img src='/logo.png' alt='logo' className=' logo-black' />
                </div>

                <div className="flex flex-col items-center justify-center  bg-transparent mr-[44px]">
                  <div className="text-[32pt] font-bold leading-none -mt-4 drop-shadow-sm bg-transparent">وکالت نامہ</div>
                  <div className="text-base mt-2 bg-transparent font-bold">ڈسٹرکٹ بار ایسوسی ایشن، بہاول نگر</div>
                </div>

                <div className="h-24 w-24 flex justify-left left 0 font-bold mt-4 ml-[125px]">
                  <span className='whitespace-nowrap text-[14pt] '>{serial}</span>
                </div>
              </div>



              {/* Price / Court Fee Banner */}
              <div className="flex justify-center items-center select-none">

                {/* Court Fee (Right Side, pointing Right Outward > ) */}

                <div className="relative h-24 w-32 ">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Left vertical edge + right tip */}
                    <polygon
                      points="-1,0 -1,100 101,50"
                      fill="transparent"
                      stroke="black"
                      strokeWidth="2.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center font-black text-center pr-8">
                    کورٹ فیس
                  </div>
                </div>

                {/* Middle Blank Octagon */}
                <div className=" flex justify-center items-center bg-transparent">
                  <div
                    className="relative flex items-center justify-center p-2"
                    style={{ width: '2.3in', height: '2.3in' }}
                  >
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon points="28,0 72,0 100,28 100,72 72,100 28,100 0,72 0,28" fill="transparent" stroke="black" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <span className="text-gray-400 font-bold z-10 select-none opacity-50 text-center leading-tight tracking-widest mt-2" style={{ fontSize: '10pt' }}>
                      ٹکٹ
                    </span>
                  </div>
                </div>

                {/* Price (Left Side, pointing Left Outward < ) */}
                <div className="relative h-24 w-32 ">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Left vertical edge + right tip */}
                    <polygon
                      points="101,0 101,100 -1,50"
                      fill="transparent"
                      stroke="black"
                      strokeWidth="2.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black  text-center pl-14">قیمتی</div>
                </div>

              </div>

              {/* Content Form Body - NOW MINIMALIST with maximized White Space */}
              <div className="flex-1 flex flex-col relative mt-8  bg-transparent">



                {/* Inner Content (The actual form) with maximized White Space */}
                <div className=" flex flex-col  px-4 bg-transparent relative z-10 ">
                  {/* Left Side: 5 Stretched 'العبد' anchors (Standard CSS Fix for Print) */}
                  <div className={`absolute top-0 bottom-0 -left-[20px] flex flex-col justify-between items-center text-black selection:bg-transparent pt-8 pb-18 ${alabdFont.className}`}>
                    <div className="rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                  </div>

                  {/* Right Side: 5 Stretched 'العبد' anchors (Standard CSS Fix for Print) */}
                  <div className={`absolute top-0 bottom-0 -right-[20px] flex flex-col justify-between items-center text-black selection:bg-transparent pt-8 pb-18 ${alabdFont.className}`}>
                    <div className="-rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[22pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                  </div>
                  <div className='flex-1 flex flex-col  bg-transparent relative z-10 px-[24px] h-fit'>
                    <div className="flex items-end text-[16pt] mb-6">
                      <div className="flex-[3] flex items-end">
                        <div className="font-bold whitespace-nowrap text-3xl">بعدالت جناب</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[1.5] flex items-end">
                        <div className="font-bold whitespace-nowrap text-[16pt] mr-6">منجانب</div>
                        <div className="flex-1 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-[16pt] mb-6">
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-[16pt]">عنوان</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-[16pt] mr-6">  بنام</div>
                        <div className="flex-1 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                      </div>
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-[16pt]">دعویٰ‌‌‌‌‌‌‌‌‌‌ / درخواست</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>


                    <div className="flex items-end text-[16pt] mb-6 w-full">

                      <div className="flex-[1.5] flex items-end">
                        <div className="font-bold text-[16pt] whitespace-nowrap">مقدمہ نمبر</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[2.5] flex items-end">
                        <div className="font-bold text-[16pt] whitespace-nowrap">جرم</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-[16pt] mb-6 w-full">
                      <div className="flex-[3] w-[45%] flex items-end">
                        <div className="font-bold whitespace-nowrap text-[16pt]">مقدمہ مندرجہ عنوان میں اپنی طرف سے بمقام</div>
                        <div className="flex-2  border-b-[2px] border-black mr-6 h-8"></div>
                        <div className="flex-4  font-bold whitespace-nowrap text-[16pt] text-left">برائے پیروی و جوابدہی اپنی طرف سے </div>
                      </div>


                    </div>
                    <div className="flex items-end text-[16pt] mb-2 w-full">
                      <div className=" font-bold whitespace-nowrap text-[16pt]">  <span className="text-3xl">محترم جناب</span> </div>
                      <div className="flex-3 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                    </div>




                    <div className="text-[16pt] leading-[2.15] text-justify font-medium leading-[32px]">
                      کو  بدین شرط وکیل مقرر کیا ہے کہ میں ہر پیشی پر خو یا بذریعہ مختیار خاص بروز پیشی حاضر ہوتا رہوں گا۔ اور بروقت پکارے جانے وکیل صاحب
                      موصوف کو اطلاع دے کر حاضر عدالت کروں گا۔ پیشی پر مظہر حاضر نہ ہوا اور مقدمہ میری غیر حاضری کی وجہ سے کسی طور پر میرے برخلاف ہو گیا
                      تو صاحب موصوف اس کے کسی طرح ذمہ دار نہ ہوں گے۔ اگر مقدمہ صاحب مذکور کی کسی دانستہ غفلت سے میرے برخلاف ہو گیا تو
                      صاحب موصوف تا حد مختانہ نقصانات یا ہرجانہ کے ذمہ دار ہوں گے۔ لیکن وکیل موصوف صدر مقام کچہری کے علاوہ اور جگہ سماعت ہونے یا
                      بروز تعطیل یا کچہری کے اوقات سے پیچھے ہونے پر مظہر کو کوئی نقصان پہنچے تو اس کے ذمہ دار اس کے واسطے کسی معاوضہ ادا کرنے یا مختانہ
                      واپس کرنے کے بھی صاحب موصوف ذمہ دار نہ ہوں گے۔ مجھ کو کل ساختہ پرداختہ صاحب موصوف مثل کردہ ذات خود قبول ہو۔ صاحب
                      موصوف کو عرضی و جواب دعویٰ اور اجراء درخواست برآمدگی منسوخی ڈگری یکطرفہ درخواست حکم امتناعی یا ترقی یا گرفتاری قبل از فیصلہ اجراء
                      ڈگری بھی صاحب موصوف کو بشرط ادائیگی علیحدہ مختانہ پیروی اختیار ہوگا۔ کہ مقدمہ مذکور یا اس کے کسی جزو کی کاروائی کے واسطے کسی دوسری
                      وکیل یا بیرسٹر کو بجائے اپنے یا اپنے ہمراہ مقرر کریں اور ایسے مشیر قانونی کو ہر امر میں اور ویسے ہی اختیارات حاصل ہوں گے جیسے صاحب
                      موصوف کو حاصل ہیں اور دوران مقدمہ میں جو کچھ ہرجانہ التوا پڑے گا وہ صاحب موصوف کو پورہ اختیار ہو گا کہ وہ مقدمہ کی پیروی نہ کریں
                      اور ایسی صورت میں میرا کوئی مطالبہ کسی قسم کا صاحب موصوف کے بر خلاف نہ ہوگا۔ نیز رقومات داخل کردہ کی ہر طرح وصولی بذریعہ چیک
                      ہائے وغیرہ کی اختیار وکیل صاحب موصوف ہوگا۔<br />
                      <div className="text-center  font-bold ">
                        لہٰذا یہ وکالت نامہ لکھ دیا ہے کہ سند رہے۔ وکالت نامہ سن لیا ہے اور اچھی طرح سمجھ لیا ہے اور منظور ہے۔ تحریر
                      </div>
                    </div>
                  </div>

                  {/* Footer Signatures: Stretched 'العبد' maximized whitespace */}
                  <div className=" ">
                    <div className={`text-[22pt] font-black  flex justify-around select-none ${alabdFont.className}`}>
                      <span className="alabid-down">العبد</span>
                      <span className="alabid-down">العبد</span>
                      <span className="alabid-down">العبد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
