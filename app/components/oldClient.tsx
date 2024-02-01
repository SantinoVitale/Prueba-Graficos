export default function OldClient({ src }: { src: string }) {
  return (
    <iframe
      id="old-nexus"
      name="old-nexus"
      title="Old Nexus Client"
      className="container h-full"
      src={src}></iframe>
  )
}
