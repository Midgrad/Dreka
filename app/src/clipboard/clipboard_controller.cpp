#include "clipboard_controller.h"

#include <QClipboard>
#include <QGuiApplication>

using namespace md::presentation;

ClipboardController::ClipboardController(QObject* parent) :
    QObject(parent),
    m_clipboard(QGuiApplication::clipboard())
{
}

void ClipboardController::setText(const QString& text)
{
    m_clipboard->setText(text, QClipboard::Clipboard);
}
