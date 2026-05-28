import Modal from "./Modal.jsx";
import MembersPanel from "./MembersPanel.jsx";

// 모바일 등 좁은 화면에서 멤버 패널을 모달로 띄운다.
// 데스크톱에서는 ProjectIssuesPage가 MembersPanel을 사이드에 직접 렌더한다.
export default function MembersModal({ projectId, open, onClose, membersState }) {
  return (
    <Modal open={open} title="프로젝트 멤버" onClose={onClose}>
      <MembersPanel
        projectId={projectId}
        members={membersState.members}
        loading={membersState.loading}
        error={membersState.error}
        reload={membersState.reload}
      />
    </Modal>
  );
}
