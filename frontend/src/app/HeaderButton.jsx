import './HeaderButton.css'
import Link from 'next/link'
import Button from '../components/ui/Button'

// Added 'className' and 'isActive' to the props
function HeaderButton({ children, myLink, onClick, style, className, isActive = false }) {
    const buttonClass = isActive
        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-0.5 border border-emerald-500/30 gap-2 px-5 inline-flex items-center justify-center rounded-md text-sm font-medium"
        : "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2";

    if (myLink) {
        return (
            <Link href={myLink} style={style}>
                <div className={`${buttonClass} ml-2 ${className || ''}`}>{children}</div>
            </Link>
        );
    }

    return (
        <div onClick={onClick} style={style} className={`${buttonClass} ${className || ''}`}>{children}</div>
    );
}

export default HeaderButton;