import './InfoCard.css'
import Input from '../../components/ui/Input'

export default function InfoCardData({text='Label: ', value='None', onChange, isEditable=false}) {
    return (
        <div className='info-card-data w-full'>
            <label className='block text-sm font-semibold text-gray-400 mb-1.5 pl-1'>
                {text.replace(':', '')}
            </label>
            <Input 
                value={value || ''} 
                onChange={onChange} 
                readOnly={!isEditable} 
                // FIXED: 'text-white' is now explicit and !important-like structure not needed but 
                // added placeholder and bg styling to ensure visibility.
                className={`
                    w-full 
                    bg-white/5 
                    border-white/10 
                    text-white 
                    placeholder:text-gray-500
                    focus:border-emerald-500/50 
                    focus:ring-1 
                    focus:ring-emerald-500/50
                    rounded-md 
                    py-2
                    ${!isEditable ? 'border-transparent bg-transparent pl-0' : 'bg-black/20'}
                `}
                // Inline style as a backup to force white text if global CSS overrides it
                style={{ color: 'white' }} 
            />
        </div>
    );
}