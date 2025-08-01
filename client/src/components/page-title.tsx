export default function PageTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="space-y-0.5">
            <h2 className="text-3xl font-bold tracking-tight text-gradient">{title}</h2>
            {subtitle ? (
                <p className="text-muted-foreground/80 text-lg">{subtitle}</p>
            ) : null}
        </div>
    );
}
