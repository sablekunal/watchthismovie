import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'My Recommendations';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000000',
                        backgroundImage: 'linear-gradient(to bottom, #000000, #111111)',
                        color: 'white',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Background Elements */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20%',
                            left: '-20%',
                            width: '140%',
                            height: '140%',
                            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent 70%)',
                            filter: 'blur(80px)',
                            zIndex: 0,
                        }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            WatchThisMovie
                        </div>

                        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, backgroundClip: 'text', color: 'transparent', backgroundImage: 'linear-gradient(to right, #ffffff, #9CA3AF)' }}>
                            {title}
                        </div>

                        <div style={{ fontSize: 28, color: '#9CA3AF' }}>
                            Stop scrolling. Start watching.
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
