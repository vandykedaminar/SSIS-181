import './HeaderButton.css'
import Link from 'next/link'
import Button from '../components/ui/Button'

// Added 'className' to the props
function HeaderButton({ children, myLink, onClick, style, className }) {
    if (myLink) {
        return (
            <Link href={myLink} style={style}>
                <Button variant="ghost" className={`ml-2 ${className || ''}`}>{children}</Button>
            </Link>
        );
    }

    return (
        <Button onClick={onClick} style={style} variant="ghost" className={className}>{children}</Button>
    );
}

export default HeaderButton;