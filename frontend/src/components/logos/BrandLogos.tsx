import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import appleTVIcon from '@/assets/logos/appletv-icon.png';
import dcLogo from '@/assets/logos/dc-logo.svg';
import harryPotterLightning from '@/assets/logos/harrypotter-lightning.svg';
import hboMaxIcon from '@/assets/logos/hbomax-appicon.png';
import marvelLogo from '@/assets/logos/marvel-logo.svg';
import netflixLogo from '@/assets/logos/netflix-logo.svg';

type BrandLogoProps = ComponentProps<'img'>;

function BrandLogo({ className, ...props }: BrandLogoProps) {
    return <img className={cn('object-contain', className)} draggable={false} {...props} />;
}

/** Marvel Comics box logo (red/white). Source: Wikimedia Commons, public domain (PD-textlogo). */
export function MarvelLogo(props: BrandLogoProps) {
    return <BrandLogo src={marvelLogo} alt="Marvel" {...props} />;
}

/** DC Comics 2024 bullet logo. Source: Wikimedia Commons, public domain (PD-textlogo). */
export function DCLogo(props: BrandLogoProps) {
    return <BrandLogo src={dcLogo} alt="DC Universe" {...props} />;
}

/** Harry Potter lightning-bolt scar mark. Source: Wikimedia Commons. */
export function HarryPotterLogo(props: BrandLogoProps) {
    return <BrandLogo src={harryPotterLightning} alt="Harry Potter" {...props} />;
}

/** Official Apple TV app icon artwork (App Store). */
export function AppleTVLogo(props: BrandLogoProps) {
    return <BrandLogo src={appleTVIcon} alt="Apple TV+" {...props} />;
}

/** Official HBO Max app icon artwork (App Store). */
export function HBOMaxLogo(props: BrandLogoProps) {
    return <BrandLogo src={hboMaxIcon} alt="HBO Max" {...props} />;
}

/** Netflix "N" tally mark, official brand red (#E50914). */
export function NetflixLogo(props: BrandLogoProps) {
    return <BrandLogo src={netflixLogo} alt="Netflix" {...props} />;
}
