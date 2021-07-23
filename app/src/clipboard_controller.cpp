#include "clipboard_controller.h"

#include <QApplication>
#include <QClipboard>

ClipboardController::ClipboardController(QObject* parent)
    : QObject(parent), m_clipboard(QApplication::clipboard()) {}

void ClipboardController::setText(const QString& text) {
  m_clipboard->setText(text, QClipboard::Clipboard);
}
