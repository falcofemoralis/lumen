package expo.modules.jsoup

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.net.URL
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import org.jsoup.nodes.Element
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

class ReactNativeJsoupModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    val instances = ConcurrentHashMap<String, Document>()
    val elements = ConcurrentHashMap<String, Element>()
    var instanceCounter = 0

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeJsoup')` in JavaScript.
    Name("ReactNativeJsoup")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world2! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    AsyncFunction("connect") { url: String, params: String, promise: Promise ->
      val connection = Jsoup.connect(url).userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0")
      val doc: Document = connection.get()
      val instanceId = "instance_${instanceCounter++}"
      instances[instanceId] = doc

      promise.resolve(instanceId)
    }

    Function("select") { instanceId: String, selector: String ->
      val doc = instances[instanceId]
      if (doc != null) {
        val els: Elements = doc.select(selector)
        val elementIds = ArrayList<String>()

        for (el in els) {
          val uniqueId = UUID.randomUUID().toString()
          elementIds.add(uniqueId)
          elements[instanceId + "_" + uniqueId] = el
        }

        elementIds
      } else {
        ArrayList<String>()
      }
    }

    Function("elementAttr") { instanceId: String, elementId: String, attr: String ->
      val element = elements[instanceId + "_" + elementId]
      if (element != null) {
        element.attr(attr)
      } else {
        ""
      }
    }

    Function("elementSelect") { instanceId: String, elementId: String, selector: String? ->
      val element = elements[instanceId + "_" + elementId]
      if (element != null) {
        val el = element.select(selector).first()

        if (el != null) {
          val uniqueId = UUID.randomUUID().toString()
          elements[instanceId + "_" + uniqueId] = el
          uniqueId
        } else {
          ""
        }
      } else {
        ""
      }
    }

    Function("elementText") { instanceId: String, elementId: String ->
      val element = elements[instanceId + "_" + elementId]
      if (element != null) {
        element.text()
      } else {
        ""
      }
    }
  }
}
