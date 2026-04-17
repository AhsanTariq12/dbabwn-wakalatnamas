import { createAdminClient } from '@/utils/supabase/server'
import DotNoise from '@/components/DotNoise'
import Guilloche from '@/components/Guilloche'
import Watermark from '@/components/Watermark'
import MicrotextLine from '@/components/MicrotextLine'
import { Amiri } from "next/font/google";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: "400",
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
            width: max-content !important; 
            height: max-content !important; 
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
          }
          /* High-resolution lock: Forces Shrink-to-Fit to perfectly replicate the monitor view */
          .print-container {
            width: 1200px !important;
            height: 1712px !important; /* Mathematically exact ratio mapping for 8.5x14 paper */
            max-height: 1712px !important; /* Critical to override tailwind max-h-[14in] preventing cutoff */
            margin: 0 !important;
            overflow: hidden !important;
          }
        }
      `}} />
      {serials.map((serial: string, index: number) => {
        const isLast = index === serials.length - 1;
        const microtext = `DBA BWN - SERIAL: ${serial} - VALID ORIGINAL - `

        return (
          <div
            key={serial}
            className="print-container relative w-full h-[14in] max-h-[14in] overflow-hidden bg-white box-border p-[15mm]"
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
            <div className="absolute inset-0 z-0 pointer-events-none border-[12px] border-transparent" style={{ padding: '8mm' }}>
              <div className="absolute top-0 left-0 right-0 overflow-hidden h-4"><MicrotextLine text={microtext} /></div>
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-4"><MicrotextLine text={microtext} /></div>
              <div className="absolute top-0 bottom-0 left-0 w-4 overflow-hidden" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}><MicrotextLine text={microtext} /></div>
              <div className="absolute top-0 bottom-0 right-0 w-4 overflow-hidden" style={{ writingMode: 'vertical-rl' }}><MicrotextLine text={microtext} /></div>
            </div>

            {/* Top / Bottom Guilloche */}
            <div className="absolute top-[12mm] left-[15mm] right-[15mm]"><Guilloche height={40} className="w-full opacity-60" /></div>
            <div className="absolute bottom-[12mm] left-[15mm] right-[15mm]"><Guilloche height={40} className="w-full opacity-60" /></div>

            {/* Inner Content - Forced to fit exactly 1 page */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>

              {/* Header */}
              <div className="flex justify-between items-start pt-8 px-4 mx-42 ">
                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-transparent shadow-sm">
                  <img src='/logo.png' alt='logo' className='w-40 logo-black' />
                </div>

                <div className="text-center flex-1 bg-transparent">
                  <div className="text-[55pt] font-bold leading-none -mt-4 drop-shadow-sm bg-transparent">وکالت نامہ</div>
                  <div className="text-[16pt] font-bold mt-2 bg-transparent">ڈسٹرکٹ بار ایسوسی ایشن بہاول نگر</div>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-transparent shadow-sm">
                  <img src='/logo.png' alt='logo' className='w-40 logo-black' />
                </div>
              </div>

              {/* Serial Number Display */}
              <div className="absolute -top-[10px] left-0 font-mono font-bold text-lg border-b-2 border-black  bg-transparent px-2 tracking-widest z-20 mx-42" dir="ltr">
                Serial No: {serial}
              </div>

              {/* Price / Court Fee Banner */}
              <div className="flex justify-between items-center my-6 px-4 mx-42 select-none">

                {/* Court Fee (Right Side, pointing Right Outward > ) */}
                <div className="flex flex-col items-center">
                  <div
                    className={` inline-block bg-black text-white px-6 py-2 rounded-full text-sm`}
                    dir="rtl"
                  >
                    صدر
                  </div>
                  <div className="text-sm mt-2 bg-transparent">ڈسٹرکٹ بار ایسوسی ایشن بہاول نگر</div>
                </div>
                <div className="flex-[0.8] relative h-24 mr-2">
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polygon points="1,1 85,1 99,50 85,99 1,99" fill="transparent" stroke="black" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold z-10 pr-4">کورٹ فیس</div>
                </div>

                {/* Middle Blank Rectangle */}
                <div className="flex-[1.8] h-24 border-[2px] border-black mx-2 bg-transparent"></div>

                {/* Price (Left Side, pointing Left Outward < ) */}
                <div className="flex-[0.8] relative h-24 ml-2">
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polygon points="99,1 15,1 1,50 15,99 99,99" fill="transparent" stroke="black" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold z-10 pl-4">قیمتی</div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={` inline-block bg-black text-white px-6 py-2 rounded-full text-sm`}
                    dir="rtl"
                  >
                    سیکرٹری
                  </div>
                  <div className="text-sm mt-2 bg-transparent">ڈسٹرکٹ بار ایسوسی ایشن بہاول نگر</div>
                </div>
              </div>

              {/* Content Form Body - NOW MINIMALIST with maximized White Space */}
              <div className="flex-1 flex flex-col relative mt-2 mx-42 bg-transparent">



                {/* Inner Content (The actual form) with maximized White Space */}
                <div className="flex-1 flex flex-col justify-between px-12 bg-transparent relative z-10 ">
                  {/* Left Side: 5 Stretched 'العبد' anchors (Standard CSS Fix for Print) */}
                  <div className="absolute top-0 bottom-0 -left-[40px] flex flex-col justify-between items-center text-black selection:bg-transparent pt-24 pb-8">
                    <div className="rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                  </div>

                  {/* Right Side: 5 Stretched 'العبد' anchors (Standard CSS Fix for Print) */}
                  <div className="absolute top-0 bottom-0 -right-[40px] flex flex-col justify-between items-center text-black selection:bg-transparent pt-24 pb-8">
                    <div className="-rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                    <div className="-rotate-90 origin-center"><span className="text-[30pt] font-black tracking-[15px] alabid-vertical inline-block">العبد</span></div>
                  </div>
                  <div className='flex-1 flex flex-col  px-12 bg-transparent relative z-10'>
                    <div className="flex items-end text-lg mb-4">
                      <div className="flex-[3] flex items-end">
                        <div className="font-bold whitespace-nowrap text-2xl">بعدالت جناب</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[1] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl mr-6">منجانب</div>
                        <div className="flex-1 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-lg mb-4">
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">مدعی</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl mr-6">مدعا علیہ</div>
                        <div className="flex-1 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-lg mb-4">
                      <div className="flex-[1.5] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">مستغیث</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[1] flex items-end justify-start">
                        <div className="font-black text-2xl px-6">بنام</div>
                        <div className="flex-1 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                      </div>
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">ملزم ریسپانڈنٹ</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-lg mb-4">
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">بعث تحریر آنکہ</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[2] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">دعویٰ</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-lg mb-4 w-full">
                     
                      <div className="flex-[1.5] flex items-end">
                        <div className="font-bold text-2xl whitespace-nowrap">مقدمہ نمبر</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                      <div className="flex-[2.5] flex items-end">
                        <div className="font-bold text-2xl whitespace-nowrap">جرم</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>

                    <div className="flex items-end text-lg mb-4 w-full">
                      <div className="flex-[3] w-[45%] flex items-end">
                        <div className="font-bold whitespace-nowrap text-xl">مقدمہ مندرجہ عنوان میں اپنی طرف سے بمقام</div>
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>
                    <div className="flex items-end text-lg mb-4 w-full">
                      <div className="flex-1 font-bold whitespace-nowrap text-2xl">برائے پیروی و جوابدہی</div>
                      <div className="flex-3 border-b-[2px] border-black mr-2 ml-2 h-8"></div>
                    </div>

                    <div className="flex items-end text-lg mb-4 w-full">
                      <div className="flex-1 flex items-end">
                        {/* <div className="font-bold whitespace-nowrap text-2xl">برائے پیروی و جوابدہی</div> */}
                        <div className="flex-1 border-b-[2px] border-black mr-4 h-8"></div>
                      </div>
                    </div>

                    <div className="text-[13pt] leading-[2.2] text-justify font-medium">
                      کو بدیں بشرط مقرر ہے کہ میں ہر پیشی پر خو یا بذریعہ مختیار خاص بروز پیشی حاضر ہوتا رہوں گا۔ اور بروقت پکارے جانے وکیل صاحب
                      موصوف کو اطلاع دے کر حاضر عدالت کروں گا۔ پیشی پر مظہر حاضر نہ ہوا اور مقدمہ میری غیر حاضری کی وجہ سے کسی طور پر میرے برخلاف ہو گیا
                      تو صاحب موصوف اس کے کسی طرح ذمہ دار نہ ہوں گے۔ اگر مقدمہ صاحب مذکور کی کسی دانستہ غفلت سے میرے برخلاف ہو گیا تو
                      صاحب موصوف تا حد مختانہ نقصانات یا ہرجانہ کے ذمہ دار ہوں گے۔ لیکن وکیل موصوف صدر مقام کچہری کے علاوہ اور جگہ سماعت ہونے یا
                      بروز تعطیل یا کچہری کے اوقات سے پیچھے ہونے پر مظہر کو کوئی نقصان پہنچے تو اس کے ذمہ دار اس کے واسطے کسی معاوضہ ادا کرنے یا مختانہ
                      واپس کرنے کے بھی صاحب موصوف ذمہ دار نہ ہوں گے۔ مجھ کو کل ساختہ پرداختہ صاحب موصوف مثل کردہ ذات خود قبول ہو۔ صاحب
                      موصوف کو عرضی و جواب دعویٰ اور اجراء درخواست برآمدگی منسوخی ڈگری یکطرفہ درخاست حکم امتناعی یا ترقی یا گرفتاری قبل از فیصلہ اجراء
                      ڈگری بھی صاحب موصوف کو بشرط ادائیگی علیحدہ مختانہ پیروی اختیار ہوگا۔ کہ مقدمہ مذکور یا اس کے کسی جزو کی کاروائی کے واسطے کسی دوسری
                      وکیل یا بیرسٹر کو بجائے اپنے یا اپنے ہمراہ مقرر کریں اور ایسے مشیر قانونی کو ہر امر میں اور ویسے ہی اختیارات حاصل ہوں گے جیسے صاحب
                      موصوف کو حاصل ہیں اور دوران مقدمہ میں جو کچھ ہرجانہ التوا پڑے گا وہ صاحب موصوف کو پورہ اختیار ہو گا کہ وہ مقدمہ کی پیروی نہ کریں
                      اور ایسی صورت میں میرا کوئی مطالبہ کسی قسم کا صاحب موصوف کے بر خلاف نہ ہوگا۔ نیز رقومات داخل کردہ کی ہر طرح وصولی بذریعہ چیک
                      ہائے وغیرہ کی اختیار وکیل صاحب موصوف ہوگا۔<br />
                      <div className="text-center mt-4 font-bold text-[16pt]">
                        لہٰذا یہ وکالت نامہ لکھ دیا ہے کہ سند رہے۔ وکالت نامہ سن لیا ہے اور اچھی طرح سمجھ لیا ہے اور منظور ہے۔ تحریر
                      </div>
                    </div>
                  </div>

                  {/* Footer Signatures: Stretched 'العبد' maximized whitespace */}
                  <div className="mt-auto ">
                    <div className="text-[30pt] font-black  flex justify-around select-none">
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
