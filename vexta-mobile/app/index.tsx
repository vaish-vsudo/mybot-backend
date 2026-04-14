import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);

  const sendMessage = async () => {
    if (!message) return;

    const newChat = [...chat, { role: "user", content: message }];
    setChat(newChat);
    setMessage("");

    try {
      const res = await fetch("https://mybot-backend-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: chat,
          personality: "study"
        })
      });

      const data = await res.json();

      setChat([...newChat, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setChat([
        ...newChat,
        { role: "assistant", content: "Error connecting 😢" }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, paddingTop: 40 }}>

        <Text style={{ fontSize: 24, fontWeight: "bold", marginLeft: 20 }}>
          Vexta 🤖
        </Text>

        {/* ✅ FIXED SCROLLVIEW */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {chat.map((msg, i) => (
            <Text key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "bold" }}>{msg.role}: </Text>
              {msg.content}
            </Text>
          ))}
        </ScrollView>

        {/* ✅ FIXED INPUT BAR */}
        <View
          style={{
            position: "absolute",
            bottom: 40,   // 👈 perfect height above nav bar
            left: 20,
            right: 20,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask a question..."
            style={{
              flex: 1,
              borderWidth: 1,
              padding: 10,
              marginRight: 10,
              borderRadius: 8,
              backgroundColor: "#fff"
            }}
          />

          <Button title="Send" onPress={sendMessage} />
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}