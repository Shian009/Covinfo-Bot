onload = function () {
  // outputs a javascript object from the parsed json

  var chat = {
    messageToSend: "",
    messageResponses: [
      "Why did the web developer leave the restaurant? Because of the table layout.",
      "How do you comfort a JavaScript bug? You console it.",
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      "What is the most used language in programming? Profanity.",
      "What is the object-oriented way to become wealthy? Inheritance.",
      "An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol",
    ],
    init: async function () {
      this.chatTree = new ChatTree();
      await this.chatTree.init();
      this.cacheDOM();
      this.bindEvents();
      await this.render();
    },
    cacheDOM: function () {
      this.$chatHistory = $(".chat-history");
      this.$button = $("button");
      this.$textarea = $("#message-to-send");
      this.$chatHistoryList = this.$chatHistory.find("ul");
    },
    bindEvents: function () {
      this.$button.on("click", this.addMessage.bind(this));
      this.$textarea.on("keyup", this.addMessageEnter.bind(this));
    },
    render: async function () {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== "") {
        var template = Handlebars.compile($("#message-template").html());
        var context = {
          messageOutput: this.messageToSend,
          time: this.getCurrentTime(),
        };

        this.input = this.messageToSend;
        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val("");

        // responses
        var templateResponse = Handlebars.compile(
          $("#message-response-template").html()
        );
        var contextResponse = {
          response: await this.chatTree.getMessage(this.input),
          time: this.getCurrentTime(),
        };

        setTimeout(
          function () {
            this.$chatHistoryList.append(templateResponse(contextResponse));
            this.scrollToBottom();
          }.bind(this),
          1000
        );
      }
    },

    addMessage: function () {
      this.messageToSend = this.$textarea.val();
      this.render();
    },
    addMessageEnter: function (event) {
      // enter was pressed
      if (event.keyCode === 13) {
        this.addMessage();
      }
    },
    scrollToBottom: function () {
      this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function () {
      return new Date()
        .toLocaleTimeString()
        .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
  };

  chat.init();
};

class ChatTree {
  constructor() {}

  async init() {
    const data = await this.reset();
    this.chat_tree = data;
    this.firstMsg = true;
    console.log("inside done");
    return "Chat has now been terminated. Send hi to begin chat again !";
  }

  async reset() {
    const response = await fetch("chat_tree.json");
    const jsonResponse = await response.json();
    return jsonResponse;
  }

  async getMessage(input) {
    let resp = "";
    if (this.firstMsg === true) {
      this.firstMsg = false;
      resp += "Hey there buddy. I am <b>covinfo</b>.<br>Enter<br> ";
    } else {
      if ("message" in this.chat_tree && input.trim() === "Reset") {
        return this.init();
      }
      input = input.slice(0, -1);
      console.log(input);
      if (
        input.localeCompare("Bye", undefined, { sensitivity: "accent" }) == 0
      ) {
        return this.init();
      }

      var s1 = input;
      //console.log(escape(input));
      let option;
      if (
        "Country".localeCompare(input, undefined, { sensitivity: "accent" }) ==
        0
      ) {
        option = 0;
      } else if (
        "State".localeCompare(input, undefined, { sensitivity: "accent" }) == 0
      )
        option = 1;
      else {
        option = 0;
      }
      this.chat_tree = this.chat_tree["children"][option];
    }
    if ("message" in this.chat_tree) {
      let data = "",
        msg;
      if (this.chat_tree["type"] === "function") {
        data =
          "It seems like you gave a wrong input!<span>&#128533;</span> Go ahead try again! <span>&#128519;</span>";
        if (this.chat_tree["message"] === "getCountry()") {
          msg = await eval(this.chat_tree["message"]);
          for (var i = 0; i < msg.length; i++) {
            var obj = msg[i];
            if (
              input.localeCompare(obj.country, undefined, {
                sensitivity: "accent",
              }) == 0
            ) {
              data =
                "<span style='color:v;'><b>Confirmed: " +
                obj.cases +
                "</b></span><br><span style='color:white;'><b>Active: " +
                obj.active +
                "</b></span><br><span style='color:white;'><b>Recovered: " +
                obj.recovered +
                "</b></span><br><span style='color:white;'><b>Deceased: " +
                obj.deaths +
                "</b></span>";
              break;
            }
          }
        } else {
          msg = await eval(this.chat_tree["message"]);
          let states = msg.statewise;
          //   console.log(states);
          for (var i = 0; i < states.length; i++) {
            if (
              input.localeCompare(states[i].state, undefined, {
                sensitivity: "accent",
              }) == 0
            ) {
              data =
                "<span style='color:white;'><b>Confirmed: " +
                states[i].confirmed +
                "</b></span><br><span style='color:white;'><b>Active: " +
                states[i].active +
                "</b></span><br><span style='color:white;'><b>Recovered: " +
                states[i].recovered +
                "</b></span><br><span style='color:white;'><b>Deceased: " +
                states[i].deaths +
                "</b></span>";
              break;
            }
          }
        }
      } else {
        data = "Tata Bye";
      }
      resp += data;
      resp += "<br><br>Please input <b>Reset</b> to reset chat now";
    } else {
      for (let i in this.chat_tree["child_msg"]) {
        resp += this.chat_tree["child_msg"][parseInt(i)] + "<br>";
      }
    }
    return resp;
  }
}

async function getCountry() {
  const response = await fetch("https://corona.lmao.ninja/v2/countries");
  const jsonResp = await response.json();
  return jsonResp;
}

async function getState() {
  const response = await fetch("https://api.covid19india.org/data.json ");
  const jsonResp = await response.json();
  return jsonResp;
}
String.prototype.equalsIgnoreCase = function (compareString) {
  return this.toUpperCase() === compareString.toUpperCase();
};
