// NoticeModal.tsx
import React from "react"
import Modal from "react-modal"

interface NoticeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onMint: () => void
}

const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onRequestClose, onMint }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-neutral-900 rounded shadow-xl p-5 border-white border w-full max-w-[400px] mx-auto mt-20 text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-[70%]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-20 "
    >
      <h2 className="text-xl font-semibold mb-4">Notice</h2>
      <p className="mb-6">
        By minting this NFT, you acknowledge that there is <strong>no roadmap</strong> or <strong>marketing</strong>{" "}
        related to this project.
      </p>

      <div className="block">
        <button
          className="hover:bg-gray-300 bg-white transition-colors text-black px-4 py-2 rounded w-full"
          onClick={onMint}
        >
          Mint
        </button>
        <button className="bg-none hover:text-gray-300 px-4 py-2 rounded mr-2 w-full" onClick={onRequestClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

export default NoticeModal
