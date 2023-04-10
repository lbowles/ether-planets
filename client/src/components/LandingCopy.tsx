type LandingCopyProps = {
  htmlFileURL: string
}

export const LandingCopy = ({ htmlFileURL }: LandingCopyProps) => {
  return (
    <>
      <iframe
        title="Embedded HTML File"
        src={htmlFileURL}
        className="full-screen-iframe"
        style={{ border: "none" }}
        scrolling="no"
      ></iframe>
      <div className=" front-content">
        <div className="z-10 relative sm:top-[24vh] top-[17vh] h-full ">
          <div className="text-white flex justify-center text-3xl  ">
            <div style={{ fontFamily: "arial", marginTop: "1px" }}>Ξ</div>PLANETS
          </div>
          <div className="text-gray-400 flex justify-center sm:text-lg text-[16px] pt-6 text-center px-3 ">
            Fully on-chain, procedurally generated, 3D planets.
          </div>
        </div>
      </div>
    </>
  )
}
