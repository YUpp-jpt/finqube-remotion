import React, {CSSProperties} from 'react';

type ProgressProps = {progress?: number};

const green = '#8bd02d';
const ink = '#13231a';
const progressValue = (value = 1) => Math.max(0, Math.min(1, value));
const row: CSSProperties = {display: 'flex', alignItems: 'center', justifyContent: 'space-between'};
const card = (width: number, height: number, radius = 24): CSSProperties => ({
  width, height, borderRadius: radius, background: '#fff', color: ink,
  boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0, fontFamily: 'inherit',
});

export const Bolt: React.FC<{color?: string; size?: number}> = ({color = '#b5ed54', size = 28}) => (
  <svg width={size} height={size * 1.35} viewBox="0 0 28 38" fill="none" aria-hidden="true">
    <path d="M11 2 6 19h15l-6 17" stroke={color} strokeWidth="6" strokeLinejoin="miter" />
  </svg>
);

const Ring: React.FC<{
  size: number; colors: string[]; portions: number[]; progress?: number;
  label?: string; labelColor?: string; smallLabel?: string; lineWidth?: number; startAngle?: number;
}> = ({size, colors, portions, progress = 1, label = '$13,271', labelColor = ink, smallLabel, lineWidth = 14, startAngle = -90}) => {
  const radius = 61;
  const circumference = Math.PI * 2 * radius;
  let offset = 0;
  const p = progressValue(progress);
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" aria-hidden="true">
      {portions.map((portion, index) => {
        const start = offset;
        offset += portion;
        const visible = Math.max(0, Math.min(portion, p - start));
        return <circle key={index} cx="85" cy="85" r={radius} fill="none" stroke={colors[index]}
          strokeWidth={lineWidth} strokeDasharray={`${visible * circumference} ${circumference}`}
          strokeDashoffset={-start * circumference} transform={`rotate(${startAngle} 85 85)`} />;
      })}
      {smallLabel && <text x="85" y="77" textAnchor="middle" fill="#969b8e" fontSize="8">{smallLabel}</text>}
      <text x="85" y={smallLabel ? 95 : 91} textAnchor="middle" fill={labelColor} fontSize="20" fontWeight={smallLabel ? 700 : 500}>{label}</text>
    </svg>
  );
};

export const Dashboard: React.FC<{light?: boolean; progress?: number}> = ({light = false, progress = 1}) => {
  const textColor = light ? '#10261c' : '#f2f4ec';
  const muted = light ? '#36463c' : '#d6dcd1';
  const border = light ? '#e8ece5' : '#263021';
  const chartColor = light ? '#aec654' : '#a6bb4d';
  const chartPath = 'M0 176 L37 147 L75 160 L111 100 L154 136 L193 114 L230 133 L273 43 L313 70 L354 29 L394 93 L434 145 L456 127';
  return (
    <div style={{...card(1000, 720, 22), background: light ? '#fff' : '#0f1710', color: textColor, display: 'flex'}}>
      <aside style={{position: 'relative', width: 150, flexShrink: 0, borderRight: `1px solid ${border}`}}>
        <div style={{position: 'absolute', top: 52, left: 27}}><Bolt color={muted} size={12} /></div>
        <div style={{position: 'absolute', top: 137, left: 27, fontWeight: 700, fontSize: 23}}>finqube</div>
        <div style={{position: 'absolute', top: 215, left: 27, display: 'flex', flexDirection: 'column', gap: 45, fontSize: 16}}>
          {['Overview', 'Transactions', 'Invoices', 'Clients', 'Reports'].map((name) => <div key={name}>{name}</div>)}
        </div>
        <div style={{position: 'absolute', bottom: -22, left: 27, width: 100, height: 78, borderRadius: 7, background: '#a7e828', color: '#294315', display: 'flex', alignItems: 'center', paddingLeft: 15, boxSizing: 'border-box', fontSize: 15}}>Get</div>
      </aside>
      <div style={{width: 850, boxSizing: 'border-box', padding: '31px 32px 26px 34px'}}>
        <div style={{...row, height: 36}}>
          <div style={{fontSize: 30}}>Dashboard</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 15, fontSize: 14}}>Alex Rivera <span style={{fontSize: 18}}>•</span></div>
        </div>
        <div style={{display: 'flex', gap: 16, marginTop: 31}}>
          {[
            ['Total Income', '$18,271'], ['Total Expenses', '$13,271'], ['Net Profit', '$5,000'],
          ].map(([name, value], index) => (
            <div key={name} style={{border: `1px solid ${border}`, borderRadius: 11, padding: '16px 19px', height: 110, flex: 1, boxSizing: 'border-box'}}>
              <div style={{fontSize: 15, color: muted, marginBottom: 12}}>{name}</div>
              <div style={{fontSize: 34, color: index === 2 ? '#a0c641' : textColor, letterSpacing: -0.4}}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: 25, marginTop: 34, height: 246}}>
          <div style={{width: 458, flexShrink: 0}}>
            <div style={{fontSize: 15, marginBottom: 16}}>Revenue &amp; Expenses</div>
            <svg width="458" height="206" viewBox="0 0 458 206" aria-hidden="true">
              {[39, 85, 132, 179].map((y) => <line key={y} x1="0" x2="458" y1={y} y2={y} stroke={border} strokeWidth="1" />)}
              <path d={`${chartPath} L456 206 L0 206 Z`} fill={chartColor} opacity={0.14 * progressValue(progress)} />
              <path d={chartPath} fill="none" stroke={chartColor} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progressValue(progress)} />
            </svg>
          </div>
          <div style={{width: 230, paddingLeft: 0, boxSizing: 'border-box'}}>
            <div style={{fontSize: 15, marginBottom: 15}}>Expenses</div>
            <Ring size={165} colors={['#88c329', '#487ad4']} portions={[0.64, 0.36]} progress={progress} labelColor={textColor} lineWidth={14} startAngle={150} />
          </div>
        </div>
        <div style={{display: 'flex', gap: 24, marginTop: 0}}>
          {['Recent Transactions', 'Top Income Sources'].map((title) => (
            <div key={title} style={{flex: 1}}>
              <div style={{fontSize: 15, marginBottom: 4}}>{title}</div>
              {['Acme Corp', 'Gamma LLC', 'Beta Studio'].map((name) => (
                <div key={name} style={{...row, borderBottom: `1px solid ${border}`, height: 50, fontSize: 16}}>
                  <span><span style={{fontSize: 13}}>•</span> {name}</span>
                  <span style={{color: '#a0c641', fontSize: 15}}>+$4,250</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const IncomeCard: React.FC<ProgressProps> = ({progress = 1}) => (
  <div style={{...card(600, 340, 26), padding: '29px 26px'}}>
    <div style={{...row, marginBottom: 28}}>
      <strong style={{fontSize: 20}}>Top Income Sources</strong>
      <span style={{fontSize: 16, color: '#a8b78a'}}>View All ›</span>
    </div>
    {[
      ['Acme Corp', '+$50,268', 1], ['Gamma LLC', '+$41,631', 0.828], ['Beta Studio', '+$34,572', 0.688],
    ].map(([name, amount, width], index) => (
      <div key={name} style={{marginBottom: index < 2 ? 22 : 0}}>
        <div style={{...row, marginBottom: 9, fontSize: 19}}><span>{name}</span><span>{amount}</span></div>
        <div style={{height: 6, background: '#edf2e4', borderRadius: 5, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${Number(width) * progressValue(progress) * 100}%`, background: green, borderRadius: 5}} />
        </div>
        <div style={{fontSize: 9, color: '#9da48f', marginTop: 5}}>Total received</div>
      </div>
    ))}
  </div>
);

export const InvoiceCard: React.FC = () => (
  <div style={{...card(600, 570, 25), padding: '30px 27px'}}>
    <div style={{...row, alignItems: 'flex-start', marginBottom: 24}}>
      <strong style={{fontSize: 25}}>Rivera Creative</strong>
      <div style={{textAlign: 'right'}}>
        <strong style={{fontSize: 24}}>INVOICE</strong>
        <div style={{fontSize: 12, marginTop: 8, color: '#a8ab9e'}}>INV-2025-001 <span style={{color: '#a7b06c'}}>• Pending</span></div>
      </div>
    </div>
    <div style={{display: 'flex', background: '#f7f8f4', padding: '25px 23px', marginBottom: 22, fontSize: 15, lineHeight: 1.7}}>
      <div style={{width: '50%'}}><div>Bill to</div><strong>Acme Corp</strong><div>New York, NY</div><div>contact@acme.com</div></div>
      <div><div>From</div><strong>Alex Rivera</strong><div>San Francisco, CA</div><div>alex@rivera.co</div></div>
    </div>
    <div style={{display: 'flex', gap: 109, fontSize: 15, lineHeight: 1.9, paddingBottom: 22}}>
      <div><div>Issue date</div><div>2025-06-01</div></div>
      <div><div>Due date</div><div>2025-06-30</div></div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 55px 95px 88px', alignItems: 'center', height: 41, fontSize: 14, color: '#8b9384', borderTop: '1px solid #e8ece3', borderBottom: '1px solid #e8ece3'}}>
      <div>Description</div><div>Qty</div><div>Rate</div><div style={{textAlign: 'right'}}>Amount</div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 55px 95px 88px', alignItems: 'center', height: 59, fontSize: 16, borderBottom: '1px solid #e8ece3'}}>
      <div>Brand identity design</div><div>1</div><div>$3,500</div><div style={{textAlign: 'right'}}>$3,500</div>
    </div>
    <div style={{marginLeft: 'auto', width: 164, marginTop: 16, fontSize: 14}}>
      <div style={{...row, marginBottom: 9}}><span>Subtotal</span><span>$3,500</span></div>
      <div style={{...row, marginBottom: 14}}><span>Tax (0%)</span><span>$0</span></div>
      <div style={{...row, fontWeight: 700, fontSize: 21}}><span>Total</span><span>$3,500</span></div>
    </div>
  </div>
);

export const ExpenseCard: React.FC<ProgressProps> = ({progress = 1}) => (
  <div style={{...card(260, 330, 19), padding: '23px 21px'}}>
    <div style={{fontSize: 15, marginBottom: 10}}>Expense Breakdown</div>
    <div style={{height: 179, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Ring size={176} colors={['#f2aa43', '#8ace2b', '#487cde']} portions={[4920 / 13271, 4363 / 13271, 3988 / 13271]} progress={progress} smallLabel="Total Expenses" lineWidth={15} />
    </div>
    {[
      ['Marketing', '$4,920', '#f2aa43'], ['Tools', '$4,363', '#8ace2b'], ['Software', '$3,988', '#487cde'],
    ].map(([name, amount, color]) => (
      <div key={name} style={{...row, fontSize: 12, height: 26}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 16, height: 7, borderRadius: 2, background: color}} />{name}</span><span>{amount}</span>
      </div>
    ))}
  </div>
);

const TransactionIcon: React.FC<{index: number}> = ({index}) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    {index === 3 ? <path d="M10 3v14M3 10h14M5 5l10 10M15 5 5 15" stroke="#b3888d" strokeWidth="1.4" /> : index === 2 ? <><circle cx="10" cy="10" r="6" stroke="#8f9f6d" /><path d="M4 10h12M10 4c-3 3-3 9 0 12M10 4c3 3 3 9 0 12" stroke="#8f9f6d" /></> : <><circle cx="10" cy="10" r="5" stroke="#8f9f6d" /><circle cx="10" cy="10" r="2" stroke="#8f9f6d" /></>}
  </svg>
);

export const TransactionsCard: React.FC = () => (
  <div style={{...card(420, 380, 24), padding: '26px 22px'}}>
    <div style={{...row, marginBottom: 15}}><strong style={{fontSize: 18}}>Recent Transactions</strong><span style={{fontSize: 12, color: '#a8b78a'}}>View All ›</span></div>
    {[
      ['Gamma LLC', 'Technology', '+$4,249'], ['Tools', 'Subscriptions', '−$143'],
      ['Beta Studio', 'Freelancing', '+$1,956'], ['Marketing', 'Advertising', '−$381'], ['Acme Corp', 'Consulting', '+$4,757'],
    ].map(([name, category, amount], index) => (
      <div key={name} style={{...row, height: 59, borderBottom: index < 4 ? '1px solid #f0f2ec' : undefined}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 29, height: 34, borderRadius: 6, background: index === 3 ? '#fff0f2' : '#f5f8ed', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><TransactionIcon index={index} /></div>
          <div><div style={{fontSize: 16, marginBottom: 5}}>{name}</div><div style={{fontSize: 10, color: '#99a18f'}}>{category}</div></div>
        </div>
        <div style={{fontSize: 16, color: index === 1 || index === 3 ? '#b88790' : ink}}>{amount}</div>
      </div>
    ))}
  </div>
);

export const CategoryCard: React.FC<ProgressProps> = ({progress = 1}) => (
  <div style={{...card(420, 210, 24), padding: '26px 25px'}}>
    <div style={{fontSize: 17, color: '#8b9384', letterSpacing: 1.7, marginBottom: 23}}>EXPENSE CATEGORIES</div>
    <div style={{height: 66, display: 'flex', overflow: 'hidden', borderRadius: 12, opacity: 0.4 + progressValue(progress) * 0.6}}>
      <div style={{width: '50%', background: '#417bdf'}} /><div style={{width: '30%', background: '#8dd439'}} /><div style={{width: '20%', background: '#f2ac43'}} />
    </div>
    <div style={{display: 'flex', gap: 18, marginTop: 18, fontSize: 12}}>
      {[['Software 50%', '#417bdf'], ['Tools 30%', '#8dd439'], ['Other 20%', '#f2ac43']].map(([label, color]) => <span key={label} style={{display: 'flex', alignItems: 'center', gap: 5}}><span style={{width: 11, height: 11, borderRadius: '50%', background: color}} />{label}</span>)}
    </div>
  </div>
);

export const PriceCard: React.FC = () => (
  <div style={{...card(360, 460, 21), display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70}}>
    <div style={{fontSize: 27, color: '#979b8e'}}>Introductory Price</div>
    <div style={{fontSize: 82, lineHeight: 1.25, fontWeight: 700, color: '#91c735', letterSpacing: -5, marginTop: 20}}>$14.90</div>
    <div style={{fontSize: 27, marginTop: 16}}>One Time Payment</div>
    <div style={{background: '#003024', color: '#fff', borderRadius: 8, width: 240, height: 57, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, marginTop: 44}}>Get Premium</div>
  </div>
);
