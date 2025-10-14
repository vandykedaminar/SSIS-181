import './InfoCard.css'

export default function InfoCardData({text='Label: ', value='None', onChange, isEditable=false}) {

    return (
        <>
            <div className='info-card-data'>
                <label>{text}</label>
                <input value={value || ''} onChange={onChange} readOnly={!isEditable} />
            </div>
        </>
    );
}