import './HeaderButton.css'
import Link from 'next/link'
import Button from '../components/ui/Button'

function HeaderButton({ children, myLink, onClick, style }) {
    if (myLink) {
        return (
            <Link href={myLink} style={style}>
                <Button variant="ghost" className="ml-2">{children}</Button>
            </Link>
        );
    }

    return (
        <Button onClick={onClick} style={style} variant="ghost">{children}</Button>
    );
}

export default HeaderButton;