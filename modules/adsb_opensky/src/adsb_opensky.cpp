#include "adsb_opensky.h"

#include <QDebug>
#include <QQmlEngine>

using namespace dreka::app;

AdsbOpensky::AdsbOpensky()
{
}

void AdsbOpensky::init()
{
    m_client = new domain::OpenskyClient(this);

    connect(m_client, &domain::OpenskyClient::adsbDataReceived, [](const QJsonArray& array) {
        qDebug() << array;
    });

    m_client->start();
}

void AdsbOpensky::done()
{
    m_client->deleteLater();
    m_client = nullptr;
}

QStringList AdsbOpensky::qmlUrls() const
{
    return {};
}
