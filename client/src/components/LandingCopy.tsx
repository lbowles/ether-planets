type LandingCopyProps = {
  htmlFileURL: string
}

export const LandingCopy = ({ htmlFileURL }: LandingCopyProps) => {
  return (
    <>
      <div className="front-content">
        <div className="text-white flex justify-center text-3xl pt-[5vh] sm:pt-[17vh]">
          <div style={{ fontFamily: "arial", marginTop: "1px" }}>Ξ</div>PLANETS
        </div>
        <div className="text-gray-400 flex justify-center sm:text-lg text-[16px] pt-6 text-center px-3 ">
          Fully on-chain, procedurally generated, 3D planets.
        </div>
      </div>
      <iframe
        title="Embedded HTML File"
        src={htmlFileURL}
        className="full-screen-iframe"
        style={{ border: "none" }}
        scrolling="no"
      ></iframe>
    </>
  )
}
