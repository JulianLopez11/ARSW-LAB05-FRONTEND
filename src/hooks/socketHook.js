import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useSocket = (author, boardName, onMessageReceived) => {
  const clientRef = useRef(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-boards'),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('Conectado a STOMP');
        //Me suscribo al topico del back con mi nombre inicial
        stompClient.subscribe(
          `/topic/boards.camilo.${boardName}`,
          (stompMessage) => {
            const board = JSON.parse(stompMessage.body);
            onMessageReceivedRef.current(board);
          }
        );
      },

      onDisconnect: () => {
        console.log('Desconectado del broker STOMP');
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => stompClient.deactivate();
  }, [boardName]);

  const sendMessage = (x, y, color = '#000000') => {
    if (clientRef.current?.connected) {
        //Publicar evento :)
      clientRef.current.publish({
        destination: '/app/draw',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          author: 'camilo',
          name: boardName,
          point: { x, y, color },
        }),
      });
    } else {
      console.warn('STOMP client no conectado');
    }
  };

  const sendClear = () => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/clear',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          author: 'camilo',
          name: boardName,
          point: { x: 0, y: 0, color: '#000000' },
        }),
      });
    } else {
      console.warn('STOMP client no conectado para borrar');
    }
  };

  return { sendMessage, sendClear };
};

export default useSocket;