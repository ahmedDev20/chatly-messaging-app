export const initialState = {
  user: {
    info: {
      uid: '',
      email: '',
      username: '',
      picture: '',
    },
    registration: {
      step: 1,
    },
    loggedIn: false,
    error: null,
  },
  users: {
    list: [],
    loading: false,
  },
  rooms: {
    list: [],
    selectedRoom: {
      id: '',
      name: '',
      icon: '',
      admin: {
        uid: null,
        username: '',
      },
    },
    loading: true,
  },
  roomMembers: {
    list: [],
    tabOpen: false,
    loading: false,
  },
  messages: {
    list: [],
    limit: 20,
    sent: true,
    loading: false,
    loadingMore: false,
    error: null,
  },
  upload: {
    file: {
      type: '',
      ext: '',
      name: '',
      previewURL: '',
      blob: null,
    },
    progress: 0,
    error: null,
    selected: false,
    uploading: false,
    uploaded: false,
  },
  error: {
    message: '',
  },
};

const reducer = (state = initialState, action) => {
  console.log('reducer', action);

  switch (action.type) {
    case 'error_caught': {
      return {
        ...state,
        error: {
          message: action.error.message,
        },
      };
    }

    case 'registration_advanced': {
      return {
        ...state,
        user: {
          ...state.user,
          info: {
            ...state.user.info,
            ...action.data,
          },
          registration: {
            step: action.step,
          },
        },
      };
    }

    case 'registration_picture_updated': {
      return {
        ...state,
        user: {
          ...state.user,
          info: {
            ...state.user.info,
            picture: action.picture,
          },
          registration: {
            step: 1,
          },
        },
        upload: {
          ...initialState.upload,
        },
      };
    }

    case 'registration_picture_skipped': {
      return {
        ...state,
        user: {
          ...state.user,
          registration: {
            step: 1,
          },
        },
        upload: {
          ...initialState.upload,
        },
      };
    }

    case 'user_registred': {
      return {
        ...state,
        user: {
          ...state.user,
          info: {
            ...state.user.info,
            ...action.user,
          },
          loggedIn: true,
        },
      };
    }

    case 'user_loggedIn': {
      return {
        ...state,
        user: {
          ...state.user,
          info: {
            ...action.data,
          },
          loggedIn: true,
        },
      };
    }

    case 'user_loggedOut': {
      return {
        ...initialState,
      };
    }

    case 'settings_changed': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };
    }

    case 'rooms_room_not_created': {
      return {
        ...state,
        error: {
          message: action.error.message,
        },
      };
    }

    case 'rooms_received': {
      return {
        ...state,
        rooms: {
          ...state.rooms,
          list: [...action.rooms],
          loading: false,
        },
      };
    }

    case 'rooms_not_received': {
      return {
        ...state,
        rooms: {
          ...state.rooms,
          loading: false,
        },
        error: {
          message: action.error.message,
        },
      };
    }

    case 'rooms_room_selected': {
      return {
        ...state,
        rooms: {
          ...state.rooms,
          selectedRoom: {
            ...action.room,
          },
        },
      };
    }

    case 'rooms_room_deleted': {
      return {
        ...state,
        rooms: {
          ...state.rooms,
          selectedRoom: {
            ...initialState.rooms.selectedRoom,
          },
        },
      };
    }

    case 'users_requested': {
      return {
        ...state,
        users: {
          loading: true,
          list: [],
        },
      };
    }

    case 'users_received': {
      return {
        ...state,
        users: {
          loading: false,
          list: action.users,
        },
      };
    }

    case 'users_not_received': {
      return {
        ...state,
        users: {
          loading: false,
          ...state.users,
        },
        error: {
          message: action.error.message,
        },
      };
    }

    case 'roomMembers_member_left': {
      return {
        ...state,
        rooms: {
          ...state.rooms,
          selectedRoom: {
            ...initialState.rooms.selectedRoom,
          },
        },
      };
    }

    case 'roomMembers_requested': {
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          loading: true,
        },
      };
    }

    case 'roomMembers_received': {
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          loading: false,
          list: action.roomMembers,
        },
      };
    }

    case 'roomMembers_not_received': {
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          loading: false,
        },
        error: {
          message: action.error.message,
        },
      };
    }

    case 'roomMembers_tab_opened': {
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          tabOpen: true,
        },
      };
    }

    case 'roomMembers_tab_closed': {
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          tabOpen: false,
        },
      };
    }

    case 'messages_msg_sending': {
      return {
        ...state,
        messages: {
          ...state.messages,
          sent: false,
        },
      };
    }

    case 'messages_msg_sent': {
      return {
        ...state,
        messages: {
          ...state.messages,
          sent: true,
        },
        upload: {
          ...initialState.state,
        },
      };
    }

    case 'messages_msg_not_sent': {
      return {
        ...state,
        messages: {
          ...state.messages,
          sent: false,
        },
        error: {
          message: action.error.message,
        },
      };
    }

    case 'messages_requested': {
      return {
        ...state,
        messages: {
          ...state.messages,
          list: [],
          loading: true,
        },
      };
    }

    case 'messages_received': {
      return {
        ...state,
        messages: {
          ...state.messages,
          list: [...action.data],
          loading: false,
        },
      };
    }

    case 'messages_more_requested': {
      return {
        ...state,
        messages: {
          ...state.messages,
          loadingMore: true,
        },
      };
    }

    case 'messages_more_received': {
      return {
        ...state,
        messages: {
          ...state.messages,
          list: [...state.messages.list, ...action.data],
          loadingMore: false,
        },
      };
    }

    case 'messages_not_received': {
      return {
        ...state,
        messages: {
          ...state.messages,
          loading: false,
        },
        error: {
          message: action.message,
        },
      };
    }

    case 'file_selected': {
      return {
        ...state,
        upload: {
          ...initialState.upload,
          file: {
            type: action.data.type,
            ext: action.data.ext,
            blob: action.data.blob,
            name: action.data.name,
            previewURL: action.data.previewURL,
          },
          selected: true,
        },
      };
    }

    case 'file_not_selected': {
      return {
        ...state,
        upload: {
          ...initialState.upload,
        },
      };
    }

    case 'file_not_supported': {
      return {
        ...state,
        error: {
          message: action.error.message,
        },
      };
    }

    case 'file_uploading': {
      return {
        ...state,
        upload: {
          ...state.upload,
          progress: action.data.progress,
          uploading: true,
        },
      };
    }

    case 'file_not_uploaded': {
      return {
        ...state,
        upload: {
          ...state.upload,
          uploading: false,
        },
        error: {
          message: action.error.message,
        },
      };
    }

    case 'file_upload_cancled': {
      return {
        ...state,
        upload: {
          ...initialState.upload,
        },
      };
    }

    default:
      return state;
  }
};

export default reducer;
