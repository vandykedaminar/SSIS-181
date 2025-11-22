import './InfoCard.css'
import Input from '../../components/ui/Input'

export default function InfoCardData({text='Label: ', value='None', onChange, isEditable=false}) {
    return (
        <div className='info-card-data'>
            <label className='block text-sm text-gray-200 mb-1'>{text}</label>
            <Input value={value || ''} onChange={onChange} readOnly={!isEditable} />
        </div>
    );
}