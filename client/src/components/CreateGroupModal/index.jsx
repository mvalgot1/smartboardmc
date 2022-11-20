import './index.css';
import { useState, useRef } from 'react';
import Modal from 'react-modal';

const CreateGroupModal = ({
  sendGroupCreationEvent,
  closeModal,
  users,
  user
}) => {
  const [isOpen, setOpen] = useState(true);
  const [usersAdded, addUser] = useState([]);
  const [name, setName] = useState('');

  const closeSelf = () => {
    setOpen(false);
    closeModal();
  };

  const onNameClick = (user) => {
    if (!usersAdded.includes(user.userId)) {
      addUser((usersAdded) => [...usersAdded, user.userId]);
    } else {
      addUser((usersAdded) =>
        usersAdded.filter((addedUser) => addedUser.userId === user.userId)
      );
    }
  };

  const createGroupAndClose = () => {
    sendGroupCreationEvent(usersAdded, name);
  };

  return (
    <Modal
      isOpen={isOpen}
      appElement={document.getElementById('root') || undefined}
    >
      <button className="close-button pull-right" onClick={closeSelf}>
        <span className="fas fa-times"></span>{' '}
      </button>
      <div className="text-center">
        <h3>Create Group</h3>
        <br />
        <div className="form-group">
          <input
            type="name"
            placeholder="Group Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '400px' }}
          />
        </div>
        <br />
        {users.map(
          (usr, index) =>
            user &&
            user.userId !== usr.userId && (
              <p
                key={index * 999}
                className="my-2 w-100"
                onClick={() => onNameClick(usr)}
                style={
                  usersAdded.includes(usr.userId)
                    ? { fontWeight: 'bold' }
                    : { fontWeight: 'normal' }
                }
              >
                {usr.name}
              </p>
            )
        )}
        <button className="btn btn-primary" onClick={createGroupAndClose}>
          Create Group
        </button>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
